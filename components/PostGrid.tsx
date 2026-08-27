"use client";

import Link from "next/link";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectAllPosts,
  selectFilteredPosts,
  selectSeedError,
  selectSeedStatus,
} from "@/store/selectors";
import { clearFilters } from "@/store/slices/uiSlice";

import { EmptyState } from "./EmptyState";
import { PostCard } from "./PostCard";
import { PostCardSkeleton } from "./Skeleton";

const SKELETON_COUNT = 6;

export function PostGrid() {
  const dispatch = useAppDispatch();
  const posts = useAppSelector(selectFilteredPosts);
  const totalPosts = useAppSelector(selectAllPosts).length;
  const status = useAppSelector(selectSeedStatus);
  const error = useAppSelector(selectSeedError);

  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

  if ((status === "idle" || status === "loading") && totalPosts === 0) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: SKELETON_COUNT }, (_, index) => (
          <PostCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (status === "failed" && totalPosts === 0) {
    return (
      <div
        role="alert"
        className="rounded-lg border border-danger-line bg-danger-soft px-4 py-3 text-sm text-danger"
      >
        {error}
      </div>
    );
  }

  if (posts.length === 0 && totalPosts > 0) {
    return (
      <EmptyState
        title="No posts match your filters"
        description="Try a different search or clear your filters to see every post."
        action={
          <button
            type="button"
            onClick={handleClearFilters}
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-ink transition-opacity hover:opacity-90"
          >
            Clear filters
          </button>
        }
      />
    );
  }

  if (posts.length === 0) {
    return (
      <EmptyState
        title="No posts yet"
        description="Start the blog by writing the first post."
        action={
          <Link
            href="/blog/new"
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-ink transition-opacity hover:opacity-90"
          >
            Write a post
          </Link>
        }
      />
    );
  }

  return (
    <div className="stagger grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <div key={post.id} className="animate-rise">
          <PostCard post={post} />
        </div>
      ))}
    </div>
  );
}
