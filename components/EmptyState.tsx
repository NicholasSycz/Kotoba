import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <section className="flex flex-col items-center px-5 py-20 text-center sm:py-24">
      <div
        aria-hidden="true"
        className="mb-5 flex size-12 items-center justify-center rounded-full bg-accent-soft text-2xl text-accent"
      >
        ∅
      </div>
      <h2 className="font-display text-2xl leading-tight text-ink">{title}</h2>
      <p className="mt-3 max-w-md text-sm leading-6 text-muted">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </section>
  );
}
