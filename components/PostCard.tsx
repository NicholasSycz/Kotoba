import Link from "next/link";

import { CATEGORY_LABELS, type Post } from "@/lib/types";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const initials = post.author.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const createdDate = new Date(post.createdAt);
  const formattedDate = createdDate.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <article className="group relative flex h-full flex-col rounded-lg border border-line bg-surface p-5 shadow-sm transition-[border-color,box-shadow,transform] duration-300 ease-out-expo hover:-translate-y-1 hover:border-accent hover:shadow-md">
      <div className="mb-4 flex items-center gap-2">
        <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-accent">
          {CATEGORY_LABELS[post.category]}
        </span>
        {post.origin === "local" ? (
          <span className="rounded-full border border-line px-2.5 py-1 text-xs font-medium text-muted">
            Yours
          </span>
        ) : null}
      </div>

      <h2 className="font-display text-2xl leading-tight text-ink">
        <Link
          href={`/blog/${post.id}`}
          className="after:absolute after:inset-0"
        >
          {post.title}
        </Link>
      </h2>

      <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-muted">
        {post.body}
      </p>

      <footer className="mt-6 flex items-center justify-between gap-4 border-t border-line pt-4 text-sm text-muted">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sunken text-xs font-semibold text-ink"
            aria-hidden
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-ink">{post.author.name}</p>
            <p>
              <time dateTime={post.createdAt}>{formattedDate}</time>
              {post.updatedAt ? <span> - Edited</span> : null}
            </p>
          </div>
        </div>

        <div className="shrink-0 text-right text-xs">
          <p>{post.baseLikes.toLocaleString()} likes</p>
          <p>{post.views.toLocaleString()} views</p>
        </div>
      </footer>
    </article>
  );
}
