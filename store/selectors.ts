/**
 * Read-side of the override model.
 *
 * The store keeps seeded posts, locally written posts, edits, and tombstones in
 * four separate buckets; nothing merges them on write. `selectAllPosts` is the
 * single place that folds them into the one list the UI actually renders, which
 * means the merge rules live in exactly one testable function.
 */

import { createSelector } from "@reduxjs/toolkit";

import { CATEGORIES, type Post, type PostEdit } from "@/lib/types";

import type { RootState } from "./index";
import type { CategoryFilter } from "./slices/uiSlice";

const selectRemote = (state: RootState) => state.posts.remote;
const selectLocal = (state: RootState) => state.posts.local;
const selectEdits = (state: RootState) => state.posts.edits;
const selectDeletedIds = (state: RootState) => state.posts.deletedIds;

export const selectSeedStatus = (state: RootState) => state.posts.status;
export const selectSeedError = (state: RootState) => state.posts.error;

export const selectCategory = (state: RootState) => state.ui.category;
export const selectQuery = (state: RootState) => state.ui.query;
export const selectTheme = (state: RootState) => state.ui.theme;
export const selectHydrated = (state: RootState) => state.ui.hydrated;

export const selectLikedIds = (state: RootState) => state.engagement.likedIds;
const selectRecentViews = (state: RootState) => state.engagement.recentlyViewed;

/**
 * Fields are copied across individually rather than spread, because an edit
 * loaded from storage may only carry some of them — and `{ ...post, ...edit }`
 * would happily overwrite a good title with `undefined`.
 */
function applyEdit(post: Post, edit: PostEdit): Post {
  return {
    ...post,
    ...(edit.title !== undefined && { title: edit.title }),
    ...(edit.body !== undefined && { body: edit.body }),
    ...(edit.category !== undefined && { category: edit.category }),
    updatedAt: edit.updatedAt,
  };
}

export const selectAllPosts = createSelector(
  [selectRemote, selectLocal, selectEdits, selectDeletedIds],
  (remote, local, edits, deletedIds): Post[] => {
    const deleted = new Set(deletedIds);
    const posts: Post[] = [];

    for (const post of Object.values(remote)) {
      if (deleted.has(post.id)) continue;
      const edit = edits[post.id];
      posts.push(edit ? applyEdit(post, edit) : post);
    }

    for (const post of Object.values(local)) {
      if (deleted.has(post.id)) continue;
      posts.push(post);
    }

    return posts.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
);

export const selectPostById = createSelector(
  [selectAllPosts, (_state: RootState, id: string) => id],
  (posts, id): Post | undefined => posts.find((post) => post.id === id),
);

/** Category and search compose here so the UI never filters a list itself. */
export const selectFilteredPosts = createSelector(
  [selectAllPosts, selectCategory, selectQuery],
  (posts, category, query): Post[] => {
    const needle = query.trim().toLowerCase();

    return posts.filter((post) => {
      if (category !== "all" && post.category !== category) return false;
      if (!needle) return true;
      return (
        post.title.toLowerCase().includes(needle) ||
        post.body.toLowerCase().includes(needle)
      );
    });
  },
);

export const selectFeaturedPosts = createSelector(
  [selectAllPosts, (_state: RootState, count: number) => count],
  (posts, count): Post[] => posts.slice(0, count),
);

export const selectCategoryCounts = createSelector(
  [selectAllPosts],
  (posts): Record<CategoryFilter, number> => {
    const counts = { all: posts.length } as Record<CategoryFilter, number>;
    for (const category of CATEGORIES) counts[category] = 0;
    for (const post of posts) counts[post.category] += 1;
    return counts;
  },
);

export const selectRecentlyViewedPosts = createSelector(
  [selectAllPosts, selectRecentViews],
  (posts, views): Post[] => {
    const byId = new Map(posts.map((post) => [post.id, post]));
    return views.flatMap((view) => {
      const post = byId.get(view.id);
      return post ? [post] : [];
    });
  },
);

export const selectIsLiked = (state: RootState, id: string): boolean =>
  state.engagement.likedIds.includes(id);

export const selectLikeCount = (state: RootState, post: Post): number =>
  post.baseLikes + (selectIsLiked(state, post.id) ? 1 : 0);

export const selectViewCount = (state: RootState, post: Post): number =>
  post.views +
  (state.engagement.recentlyViewed.some((view) => view.id === post.id) ? 1 : 0);
