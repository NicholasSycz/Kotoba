"use client";

import { EmptyState } from "@/components/EmptyState";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <EmptyState
      title="Something went wrong"
      description={
        error.message ||
        "This page failed to render. Your saved posts are untouched."
      }
      action={
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-ink transition-opacity hover:opacity-90"
        >
          Try again
        </button>
      }
    />
  );
}
