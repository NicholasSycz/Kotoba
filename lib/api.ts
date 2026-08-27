/**
 * DummyJSON client and normalizers.
 *
 * Why DummyJSON: the brief suggests FakeBlog (RapidAPI) but explicitly allows
 * substitutes. DummyJSON needs no API key — which matters, because this is a
 * front-end-only app with nowhere safe to keep one — and its `/posts/tag/{tag}`
 * endpoint gives us three *real* categories instead of ones we invented.
 */

import { CATEGORIES, type Author, type Category, type Post } from "./types";

const API_BASE = "https://dummyjson.com";

/** Posts requested per category. Dedup means the final count is a little lower. */
const POSTS_PER_CATEGORY = 12;

/**
 * DummyJSON posts carry no timestamps, so we derive one. It has to be
 * deterministic: a `Date.now()`-relative value would reshuffle the feed on
 * every reload and make "newest first" meaningless.
 */
const SEED_EPOCH = Date.UTC(2026, 7, 1);
const SEED_INTERVAL_MS = 19 * 60 * 60 * 1000;

interface DummyPost {
  id: number;
  title: string;
  body: string;
  tags: string[];
  reactions: { likes: number; dislikes: number };
  views: number;
  userId: number;
}

interface DummyPostsResponse {
  posts: DummyPost[];
  total: number;
  skip: number;
  limit: number;
}

interface DummyUser {
  id: number;
  firstName: string;
  lastName: string;
  image: string;
}

interface DummyUsersResponse {
  users: DummyUser[];
  total: number;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE}${path}`, { signal });
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === "AbortError") throw cause;
    throw new ApiError(
      "Couldn't reach the blog service. Check your connection and try again.",
    );
  }

  if (!response.ok) {
    throw new ApiError(
      `The blog service responded with ${response.status}.`,
      response.status,
    );
  }

  return (await response.json()) as T;
}

/** Seeded ids are namespaced so they can never collide with local ones. */
export function remoteId(dummyId: number): string {
  return `remote-${dummyId}`;
}

function seedDate(dummyId: number): string {
  return new Date(SEED_EPOCH - dummyId * SEED_INTERVAL_MS).toISOString();
}

function toAuthor(user: DummyUser | undefined): Author {
  if (!user) return { name: "Anonymous", avatar: "" };
  return {
    name: `${user.firstName} ${user.lastName}`,
    avatar: user.image,
  };
}

function toPost(
  dummy: DummyPost,
  category: Category,
  usersById: Map<number, DummyUser>,
): Post {
  return {
    id: remoteId(dummy.id),
    title: dummy.title,
    body: dummy.body,
    category,
    author: toAuthor(usersById.get(dummy.userId)),
    createdAt: seedDate(dummy.id),
    tags: dummy.tags,
    baseLikes: dummy.reactions.likes,
    views: dummy.views,
    origin: "remote",
  };
}

export async function fetchSeedPosts(signal?: AbortSignal): Promise<Post[]> {
  const [users, ...byCategory] = await Promise.all([
    fetchJson<DummyUsersResponse>(
      "/users?limit=0&select=firstName,lastName,image",
      signal,
    ),
    ...CATEGORIES.map((category) =>
      fetchJson<DummyPostsResponse>(
        `/posts/tag/${category}?limit=${POSTS_PER_CATEGORY}`,
        signal,
      ),
    ),
  ]);

  const usersById = new Map(users.users.map((user) => [user.id, user]));
  const seen = new Set<number>();
  const posts: Post[] = [];

  CATEGORIES.forEach((category, index) => {
    for (const dummy of byCategory[index].posts) {
      if (seen.has(dummy.id)) continue;
      seen.add(dummy.id);
      posts.push(toPost(dummy, category, usersById));
    }
  });

  return posts;
}
