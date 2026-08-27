import Link from "next/link";

import { EmptyState } from "@/components/EmptyState";

export default function NotFound() {
  return (
    <EmptyState
      title="Page not found"
      description="That link does not lead anywhere on this site. The blog is still where you left it."
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
