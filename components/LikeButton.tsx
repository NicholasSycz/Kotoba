"use client";

import type { Post } from "@/lib/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectIsLiked, selectLikeCount } from "@/store/selectors";
import { toggleLike } from "@/store/slices/engagementSlice";

interface LikeButtonProps {
  post: Post;
}

export function LikeButton({ post }: LikeButtonProps) {
  const dispatch = useAppDispatch();
  const liked = useAppSelector((state) => selectIsLiked(state, post.id));
  const likes = useAppSelector((state) => selectLikeCount(state, post));

  return (
    <button
      type="button"
      aria-pressed={liked}
      onClick={() => dispatch(toggleLike(post.id))}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
        liked
          ? "border-accent bg-accent text-accent-ink"
          : "border-line text-muted hover:border-accent hover:text-ink"
      }`}
    >
      {liked ? "Liked" : "Like"}
      <span className="ml-2 opacity-70">{likes.toLocaleString()}</span>
    </button>
  );
}
