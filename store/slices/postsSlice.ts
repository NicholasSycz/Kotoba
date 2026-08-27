/**
 * The heart of the app: seeded posts and the reader's changes to them are kept
 * in four separate buckets and merged at read time (see `store/selectors.ts`).
 *
 * The obvious alternative — merge on write and persist one flat array of posts
 * — is simpler but wrong: it freezes the seed feed permanently, because the
 * stored array shadows whatever the API returns on the next load. Keeping the
 * reader's changes as a thin layer of overrides means the two can evolve
 * independently, and a deleted or edited seed post stays deleted or edited even
 * though the API happily keeps serving the original.
 */

import { createAsyncThunk, createSlice, nanoid } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import { fetchSeedPosts } from "@/lib/api";
import type { Post, PostDraft, PostEdit } from "@/lib/types";

import { hydrate } from "../hydrate";

export type SeedStatus = "idle" | "loading" | "succeeded" | "failed";

export interface PostsState {
  /** Fetched every load, never persisted. */
  remote: Record<string, Post>;
  /** Written by the reader. Persisted. */
  local: Record<string, Post>;
  /** Overrides layered on top of `remote`. Persisted. */
  edits: Record<string, PostEdit>;
  /** Tombstones. Persisted, and applied to both `remote` and `local`. */
  deletedIds: string[];
  status: SeedStatus;
  error: string | null;
}

const initialState: PostsState = {
  remote: {},
  local: {},
  edits: {},
  deletedIds: [],
  status: "idle",
  error: null,
};

export const loadSeedPosts = createAsyncThunk<
  Post[],
  void,
  { rejectValue: string }
>("posts/loadSeed", async (_, { signal, rejectWithValue }) => {
  try {
    return await fetchSeedPosts(signal);
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    return rejectWithValue(
      error instanceof Error
        ? error.message
        : "Something went wrong loading the blog feed.",
    );
  }
});

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    createPost: {
      reducer(state, action: PayloadAction<Post>) {
        state.local[action.payload.id] = action.payload;
      },
      /**
       * Ids and timestamps are generated here rather than in the component, so
       * the reducer itself stays pure and testable.
       */
      prepare(draft: PostDraft, author: Post["author"]) {
        const now = new Date().toISOString();
        return {
          payload: {
            id: `local-${nanoid()}`,
            title: draft.title.trim(),
            body: draft.body.trim(),
            category: draft.category,
            author,
            createdAt: now,
            tags: [draft.category],
            baseLikes: 0,
            views: 0,
            origin: "local",
          } satisfies Post,
        };
      },
    },

    /**
     * Editing a local post rewrites it in place. Editing a seeded post records
     * an override instead, leaving the fetched original untouched.
     */
    updatePost: {
      reducer(
        state,
        action: PayloadAction<{ id: string; draft: PostDraft; updatedAt: string }>,
      ) {
        const { id, draft, updatedAt } = action.payload;
        const title = draft.title.trim();
        const body = draft.body.trim();

        const existing = state.local[id];
        if (existing) {
          existing.title = title;
          existing.body = body;
          existing.category = draft.category;
          existing.updatedAt = updatedAt;
          return;
        }

        state.edits[id] = { title, body, category: draft.category, updatedAt };
      },
      prepare(id: string, draft: PostDraft) {
        return {
          payload: { id, draft, updatedAt: new Date().toISOString() },
        };
      },
    },

    /**
     * Deletion is a tombstone, not a removal. That keeps undo trivial and means
     * a deleted seed post stays gone across reloads even though the API will
     * keep returning it.
     */
    deletePost(state, action: PayloadAction<string>) {
      if (!state.deletedIds.includes(action.payload)) {
        state.deletedIds.push(action.payload);
      }
    },

    restorePost(state, action: PayloadAction<string>) {
      state.deletedIds = state.deletedIds.filter((id) => id !== action.payload);
    },
  },

  extraReducers(builder) {
    builder
      /**
       * Merged, not assigned. Hydration lands a paint after mount, so anything
       * dispatched in that window would be discarded by a wholesale overwrite.
       * Live state wins on conflict, since it is by definition the newer edit.
       */
      .addCase(hydrate, (state, action) => {
        state.local = { ...action.payload.local, ...state.local };
        state.edits = { ...action.payload.edits, ...state.edits };
        state.deletedIds = [
          ...new Set([...action.payload.deletedIds, ...state.deletedIds]),
        ];
      })
      .addCase(loadSeedPosts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loadSeedPosts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.remote = Object.fromEntries(
          action.payload.map((post) => [post.id, post]),
        );
      })
      .addCase(loadSeedPosts.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload ?? "Something went wrong loading the blog feed.";
      });
  },
});

export const { createPost, updatePost, deletePost, restorePost } =
  postsSlice.actions;

export default postsSlice.reducer;
