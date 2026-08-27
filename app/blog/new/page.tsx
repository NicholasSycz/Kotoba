import type { Metadata } from "next";

import { PostForm } from "@/components/PostForm";

export const metadata: Metadata = {
  title: "Write — Kotoba",
  description: "Write a new local post on Kotoba.",
};

export default function NewPostPage() {
  return (
    <section className="animate-rise">
      <header className="mb-8">
        <h1 className="font-display text-4xl leading-tight text-ink text-balance sm:text-5xl">
          Write a post
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
          Your post is saved in this browser and appears alongside the seeded
          feed.
        </p>
      </header>

      <PostForm mode="create" />
    </section>
  );
}
