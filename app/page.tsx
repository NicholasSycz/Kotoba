import Link from "next/link";

// TODO: Update the Hero component, verify that it complies with the assignment.
export default function HomePage() {
  return (
    <section className="animate-rise">
      <h1 className="font-display text-5xl leading-tight tracking-tight text-balance sm:text-6xl">
        A small blog you can read, write, and rewrite.
      </h1>
      <p className="mt-5 max-w-xl text-lg text-muted">
        Kotoba is seeded with posts from a public API. Anything you write, edit,
        or delete lives in your browser and survives a reload.
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
      </div>
    </section>
  );
}
