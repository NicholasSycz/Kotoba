import type { Metadata } from "next";

import { CategoryFilter } from "@/components/CategoryFilter";
import { PostGrid } from "@/components/PostGrid";
import { SearchBar } from "@/components/SearchBar";

export const metadata: Metadata = {
  title: "Blog — Kotoba",
  description:
    "Every post on Kotoba: seeded from a public API, plus anything you've written yourself.",
};

export default function BlogPage() {
  return (
    <section className="space-y-8">
      <header className="animate-rise">
        <h1 className="font-display text-4xl leading-tight tracking-tight text-ink text-balance sm:text-5xl">
          The blog
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
          Browse seeded posts from the public API alongside anything you have
          written locally in this browser session.
        </p>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar />
        <CategoryFilter />
      </div>

      <PostGrid />
    </section>
  );
}
