/**
 * Domain types for Kotoba.
 *
 * The app merges two sources of posts — seed posts fetched from DummyJSON and
 * posts the reader creates locally — into a single `Post` shape, so the UI
 * never needs to care where a post came from. The `origin` field is the one
 * place that distinction survives, because a few behaviours depend on it.
 */

export const CATEGORIES = ["history", "crime", "fiction"] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  history: "History",
  crime: "Crime",
  fiction: "Fiction",
};

export function isCategory(value: unknown): value is Category {
  return (
    typeof value === "string" && CATEGORIES.includes(value as Category)
  );
}

export interface Author {
  name: string;
  avatar: string;
}

export interface Post {
  /** `remote-<n>` for seeded posts, `local-<uuid>` for reader-created ones. */
  id: string;
  title: string;
  body: string;
  category: Category;
  author: Author;
  /** ISO 8601. Seeded posts get a deterministic date — see `lib/api.ts`. */
  createdAt: string;
  updatedAt?: string;
  tags: string[];
  /** Like count from the source data. The reader's own like is added on top. */
  baseLikes: number;
  views: number;
  origin: "remote" | "local";
}

/** The fields a reader can actually set. Everything else is derived. */
export interface PostDraft {
  title: string;
  body: string;
  category: Category;
}


export interface PostEdit extends Partial<PostDraft> {
  updatedAt: string;
}

export interface RecentView {
  id: string;
  viewedAt: string;
}

export type Theme = "high-contrast" | "dark" | "system";

export const THEMES: readonly Theme[] = ["high-contrast", "dark", "system"];

export function isTheme(value: unknown): value is Theme {
  return typeof value === "string" && THEMES.includes(value as Theme);
}
