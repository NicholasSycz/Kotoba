"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAppSelector } from "@/store/hooks";
import {
  selectAllPosts,
  selectFeaturedPosts,
  selectRecentlyViewedPosts,
  selectSeedStatus,
} from "@/store/selectors";

import { PostCard } from "./PostCard";
import { PostCardSkeleton } from "./Skeleton";

const FEATURED_COUNT = 3;

export function HomeContent() {
  const router = useRouter();
  const posts = useAppSelector(selectAllPosts);
  const featured = useAppSelector((state) =>
    selectFeaturedPosts(state, FEATURED_COUNT),
  );
  const recentlyViewed = useAppSelector(selectRecentlyViewedPosts);
  const status = useAppSelector(selectSeedStatus);
  const loading = (status === "idle" || status === "loading") && posts.length === 0;

  const handleRandomPost = () => {
    if (posts.length === 0) return;
    const post = posts[Math.floor(Math.random() * posts.length)];
    router.push(`/blog/${post.id}`);
  };

  return (
    <div className="space-y-14">
      <section className="animate-rise">
        <h1 className="font-display text-5xl leading-tight tracking-tight text-balance sm:text-6xl">
          A small blog you can read, write, and rewrite.
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-8 text-muted">
          Kotoba is seeded with posts from a public API. Anything you write,
          edit, like, or delete lives in your browser and survives a reload.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/blog"
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-ink transition-opacity hover:opacity-90"
          >
            Read the blog
          </Link>
          <Link
            href="/blog/new"
            className="rounded-full border border-line px-5 py-2.5 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
          >
            Write a post
          </Link>
          <button
            type="button"
            onClick={handleRandomPost}
            disabled={posts.length === 0}
            className="rounded-full border border-line px-5 py-2.5 text-sm font-medium transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            Find me a random post
          </button>
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl leading-tight text-ink">
              Featured posts
            </h2>
            <p className="mt-2 text-sm text-muted">
              The newest stories from the merged feed.
            </p>
          </div>
          <Link
            href="/blog"
            className="shrink-0 text-sm font-medium text-muted transition-colors hover:text-ink"
          >
            View all
          </Link>
        </div>

        <div className="stagger grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: FEATURED_COUNT }, (_, index) => (
                <PostCardSkeleton key={index} />
              ))
            : featured.map((post) => (
                <div key={post.id} className="animate-rise">
                  <PostCard post={post} />
                </div>
              ))}
        </div>
      </section>

      {recentlyViewed.length > 0 ? (
        <section>
          <h2 className="font-display text-3xl leading-tight text-ink">
            Recently viewed
          </h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {recentlyViewed.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.id}`}
                className="rounded-lg border border-line bg-surface p-4 transition-colors hover:border-accent"
              >
                <p className="font-medium text-ink">{post.title}</p>
                <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted">
                  {post.body}
                </p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
