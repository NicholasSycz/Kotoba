/**
 * localStorage read/write for the slice of state the reader owns.
 *
 * Only the *local layer* is persisted — posts the reader wrote, edits they made
 * to seeded posts, tombstones for ones they deleted, and their engagement.
 * Seed posts are deliberately excluded: they are re-fetched on every load, so
 * persisting them would freeze the feed at whatever the API returned the first
 * time the reader ever visited.
 */

import { z } from "zod";

import {
  CATEGORIES,
  THEMES,
  type Post,
  type PostEdit,
  type RecentView,
  type Theme,
} from "./types";

export const STORAGE_KEY = "kotoba:v1";
const STORAGE_VERSION = 1;

export interface PersistedState {
  local: Record<string, Post>;
  edits: Record<string, PostEdit>;
  deletedIds: string[];
  likedIds: string[];
  recentlyViewed: RecentView[];
  theme: Theme;
}

export const EMPTY_PERSISTED_STATE: PersistedState = {
  local: {},
  edits: {},
  deletedIds: [],
  likedIds: [],
  recentlyViewed: [],
  theme: "system",
};

const categorySchema = z.enum(CATEGORIES);
const themeSchema = z.enum(THEMES as readonly [Theme, ...Theme[]]);

const postSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
  category: categorySchema,
  author: z.object({
    name: z.string(),
    avatar: z.string().catch(""),
  }),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  tags: z.array(z.string()).catch([]),
  baseLikes: z.number().catch(0),
  views: z.number().catch(0),
  origin: z.enum(["remote", "local"]).catch("local"),
});

const editSchema = z.object({
  title: z.string().optional(),
  body: z.string().optional(),
  category: categorySchema.optional(),
  updatedAt: z.string().catch(() => new Date(0).toISOString()),
});

const recentViewSchema = z.object({
  id: z.string(),
  viewedAt: z.string().catch(() => new Date(0).toISOString()),
});

/**
 * Validates each entry independently and drops the ones that fail, rather than
 * rejecting the whole collection because of a single bad record. One corrupt
 * post shouldn't cost the reader everything else they wrote.
 */
function lenientRecord<T>(schema: z.ZodType<T>) {
  return z
    .record(z.string(), z.unknown())
    .transform((raw) =>
      Object.entries(raw).reduce<Record<string, T>>((acc, [key, value]) => {
        const parsed = schema.safeParse(value);
        if (parsed.success) acc[key] = parsed.data;
        return acc;
      }, {}),
    );
}

function lenientArray<T>(schema: z.ZodType<T>) {
  return z
    .array(z.unknown())
    .transform((raw) =>
      raw.flatMap((value) => {
        const parsed = schema.safeParse(value);
        return parsed.success ? [parsed.data] : [];
      }),
    );
}

/**
 * Every field falls back to its empty value, so a partially-written payload
 * still yields a usable state. The version is the one exception: an unfamiliar
 * shape fails the whole parse, because guessing at data we can't read is worse
 * than starting clean.
 */
const persistedSchema = z.object({
  version: z.literal(STORAGE_VERSION),
  local: lenientRecord(postSchema).catch({}),
  edits: lenientRecord(editSchema).catch({}),
  deletedIds: lenientArray(z.string()).catch([]),
  likedIds: lenientArray(z.string()).catch([]),
  recentlyViewed: lenientArray(recentViewSchema).catch([]),
  theme: themeSchema.catch("system"),
});

/**
 * Reads persisted state, tolerating every way this can go wrong: no storage at
 * all (SSR), storage that throws (Safari private browsing), absent keys,
 * invalid JSON, an unknown version, and individually malformed entries.
 */
export function loadState(): PersistedState {
  if (typeof window === "undefined") return EMPTY_PERSISTED_STATE;

  let raw: string | null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return EMPTY_PERSISTED_STATE;
  }

  if (!raw) return EMPTY_PERSISTED_STATE;

  let result: z.ZodSafeParseResult<z.infer<typeof persistedSchema>>;
  try {
    result = persistedSchema.safeParse(JSON.parse(raw));
  } catch {
    return EMPTY_PERSISTED_STATE;
  }

  if (!result.success) return EMPTY_PERSISTED_STATE;

  // Listed explicitly rather than spread, so the compiler checks the schema
  // still produces exactly the domain shape.
  return {
    local: result.data.local,
    edits: result.data.edits,
    deletedIds: result.data.deletedIds,
    likedIds: result.data.likedIds,
    recentlyViewed: result.data.recentlyViewed,
    theme: result.data.theme,
  };
}

/** Best-effort write. A full or unavailable quota must not break the app. */
export function saveState(state: PersistedState): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: STORAGE_VERSION, ...state }),
    );
  } catch {
    // Quota exceeded or storage disabled — the app stays usable for this
    // session, the changes just won't outlive it.
  }
}
