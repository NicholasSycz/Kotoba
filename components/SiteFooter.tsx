export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-1 px-5 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>
          Kotoba — a small blog you can read, write, and rewrite.
        </p>
        <p>
          Posts seeded from{" "}
          <a
            href="https://dummyjson.com"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-4 transition-colors hover:text-accent"
          >
            DummyJSON
          </a>
          . Your changes stay in this browser.
        </p>
      </div>
    </footer>
  );
}
