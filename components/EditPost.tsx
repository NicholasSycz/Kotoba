"use client";

import Link from "next/link";

import { useAppSelector } from "@/store/hooks";
import { selectPostById, selectSeedError, selectSeedStatus } from "@/store/selectors";

import { EmptyState } from "./EmptyState";
import { PostForm } from "./PostForm";
import { Skeleton } from "./Skeleton";

interface EditPostProps {
  id: string;
}

function EditPostSkeleton() {
  return (
    <section className="animate-rise max-w-2xl">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="mt-8 h-10 w-full" />
      <Skeleton className="mt-6 h-10 w-48" />
      <Skeleton className="mt-6 h-64 w-full" />
    </section>
  );
}

export function EditPost({ id }: EditPostProps) {
  const post = useAppSelector((state) => selectPostById(state, id));
  const status = useAppSelector(selectSeedStatus);
  const error = useAppSelector(selectSeedError);

  if (!post && (status === "idle" || status === "loading")) {
    return <EditPostSkeleton />;
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

  return (
    <section className="animate-rise">
      <header className="mb-8">
        <h1 className="font-display text-4xl leading-tight text-ink text-balance sm:text-5xl">
          Edit post
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
          Changes are saved locally and layered over the current post.
        </p>
      </header>

      <PostForm mode="edit" post={post} />
    </section>
  );
}
