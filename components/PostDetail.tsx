"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { CATEGORY_LABELS } from "@/lib/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectPostById,
  selectSeedError,
  selectSeedStatus,
  selectViewCount,
} from "@/store/selectors";
import { recordView } from "@/store/slices/engagementSlice";
import { deletePost } from "@/store/slices/postsSlice";
import { showUndoToast } from "@/store/slices/uiSlice";

import { Avatar } from "./Avatar";
import { ConfirmDialog } from "./ConfirmDialog";
import { EmptyState } from "./EmptyState";
import { LikeButton } from "./LikeButton";
import { Skeleton } from "./Skeleton";

interface PostDetailProps {
  id: string;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function PostDetailSkeleton() {
  return (
    <article className="animate-rise max-w-3xl">
      <Skeleton className="h-6 w-28 rounded-full" />
      <Skeleton className="mt-5 h-12 w-4/5" />
      <Skeleton className="mt-4 h-5 w-72" />
      <div className="mt-10 space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-full" />
      </div>
    </article>
  );
}

export function PostDetail({ id }: PostDetailProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const post = useAppSelector((state) => selectPostById(state, id));
  const views = useAppSelector((state) =>
    post ? selectViewCount(state, post) : 0,
  );
  const status = useAppSelector(selectSeedStatus);
  const error = useAppSelector(selectSeedError);

  useEffect(() => {
    if (post) dispatch(recordView(post.id));
  }, [dispatch, post]);

  if (!post && (status === "idle" || status === "loading")) {
    return <PostDetailSkeleton />;
  }

  if (!post) {
    return (
      <EmptyState
        title="Post not found"
        description={
          status === "failed" && error
            ? error
            : "This post may have been deleted or the link may be out of date."
        }
        action={
          <Link
            href="/blog"
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-ink transition-opacity hover:opacity-90"
          >
            Back to blog
          </Link>
        }
      />
    );
  }

  const created = formatDate(post.createdAt);
  const updated = post.updatedAt ? formatDate(post.updatedAt) : null;

  const handleDelete = () => {
    dispatch(deletePost(post.id));
    dispatch(showUndoToast({ postId: post.id, title: post.title }));
    setDeleteOpen(false);
    router.push("/blog");
  };

  return (
    <article className="animate-rise max-w-3xl">
      <Link
        href="/blog"
        className="text-sm font-medium text-muted transition-colors hover:text-ink"
      >
        Back to blog
      </Link>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-accent">
          {CATEGORY_LABELS[post.category]}
        </span>
        {post.origin === "local" ? (
          <span className="rounded-full border border-line px-2.5 py-1 text-xs font-medium text-muted">
            Yours
          </span>
        ) : null}
      </div>

      <h1 className="mt-5 font-display text-4xl leading-tight text-ink text-balance sm:text-6xl">
        {post.title}
      </h1>

      <div className="mt-6 flex flex-col gap-5 border-b border-line pb-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar
            name={post.author.name}
            src={post.author.avatar}
            size={44}
            className="text-sm"
          />
          <div className="min-w-0">
            <p className="truncate font-medium text-ink">{post.author.name}</p>
            <p className="text-sm text-muted">
              <time dateTime={post.createdAt}>{created}</time>
              {updated ? <span> - Edited {updated}</span> : null}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <LikeButton post={post} />
          <Link
            href={`/blog/${post.id}/edit`}
            className="rounded-full border border-line px-4 py-2 text-sm font-medium text-muted transition-colors hover:border-accent hover:text-ink"
          >
            Edit
          </Link>
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="rounded-full border border-line px-4 py-2 text-sm font-medium text-muted transition-colors hover:border-accent hover:text-ink"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="prose-body mt-8 text-lg text-ink">{post.body}</div>

      <footer className="mt-10 flex flex-wrap gap-4 border-t border-line pt-5 text-sm text-muted">
        <span>{views.toLocaleString()} views</span>
        <span>{post.tags.map((tag) => `#${tag}`).join(" ")}</span>
      </footer>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete this post?"
        description="The post will disappear from your blog, but you can undo it from the next screen."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </article>
  );
}
