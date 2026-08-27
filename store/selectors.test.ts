import { describe, expect, it } from "vitest";

import type { Post } from "@/lib/types";

import {
  selectAllPosts,
  selectCategoryCounts,
  selectFilteredPosts,
  selectRecentlyViewedPosts,
} from "./selectors";
import type { RootState } from "./index";

function post(overrides: Partial<Post> & Pick<Post, "id">): Post {
  return {
    title: "Untitled",
    body: "Body text.",
    category: "fiction",
    author: { name: "Ada Lovelace", avatar: "" },
    createdAt: "2026-01-01T00:00:00.000Z",
    tags: [],
    baseLikes: 0,
    views: 0,
    origin: "remote",
    ...overrides,
  };
}

/** Only the fields the selectors read; the rest of the tree is irrelevant here. */
function state(posts: Partial<RootState["posts"]>, ui = {}, engagement = {}) {
  return {
    posts: {
      remote: {},
      local: {},
      edits: {},
      deletedIds: [],
      status: "succeeded",
      error: null,
      ...posts,
    },
    ui: { category: "all", query: "", theme: "system", hydrated: true, ...ui },
    engagement: { likedIds: [], recentlyViewed: [], ...engagement },
  } as RootState;
}

describe("selectAllPosts", () => {
  it("returns seeded and local posts together, newest first", () => {
    const result = selectAllPosts(
      state({
        remote: {
          "remote-1": post({
            id: "remote-1",
            createdAt: "2026-01-01T00:00:00.000Z",
          }),
        },
        local: {
          "local-a": post({
            id: "local-a",
            origin: "local",
            createdAt: "2026-06-01T00:00:00.000Z",
          }),
        },
      }),
    );

    expect(result.map((p) => p.id)).toEqual(["local-a", "remote-1"]);
  });

  it("layers an edit over the seeded post without mutating the original", () => {
    const original = post({ id: "remote-1", title: "Original", body: "Before" });
    const input = state({
      remote: { "remote-1": original },
      edits: {
        "remote-1": {
          title: "Edited",
          updatedAt: "2026-02-02T00:00:00.000Z",
        },
      },
    });

    const [merged] = selectAllPosts(input);

    expect(merged.title).toBe("Edited");
    // Fields the edit didn't touch survive.
    expect(merged.body).toBe("Before");
    expect(merged.updatedAt).toBe("2026-02-02T00:00:00.000Z");
    // The seed bucket is untouched, so a re-fetch can't be corrupted by it.
    expect(original.title).toBe("Original");
  });

  it("hides tombstoned posts from both buckets", () => {
    const result = selectAllPosts(
      state({
        remote: { "remote-1": post({ id: "remote-1" }) },
        local: { "local-a": post({ id: "local-a", origin: "local" }) },
        deletedIds: ["remote-1", "local-a"],
      }),
    );

    expect(result).toEqual([]);
  });

  it("keeps a seeded post deleted even though the API still serves it", () => {
    // This is the case the naive "persist one merged array" approach gets
    // wrong: the fetch repopulates `remote`, but the tombstone still applies.
    const afterRefetch = state({
      remote: {
        "remote-1": post({ id: "remote-1" }),
        "remote-2": post({ id: "remote-2" }),
      },
      deletedIds: ["remote-1"],
    });

    expect(selectAllPosts(afterRefetch).map((p) => p.id)).toEqual(["remote-2"]);
  });
});

describe("selectFilteredPosts", () => {
  const posts = {
    "remote-1": post({ id: "remote-1", title: "A Roman road", category: "history" }),
    "remote-2": post({ id: "remote-2", title: "The stolen key", category: "crime" }),
    "remote-3": post({ id: "remote-3", title: "Ghost story", category: "fiction" }),
  };

  it("filters by category", () => {
    const result = selectFilteredPosts(
      state({ remote: posts }, { category: "crime" }),
    );
    expect(result.map((p) => p.id)).toEqual(["remote-2"]);
  });

  it("searches title and body, case-insensitively", () => {
    expect(
      selectFilteredPosts(state({ remote: posts }, { query: "ROMAN" })).map(
        (p) => p.id,
      ),
    ).toEqual(["remote-1"]);

    const bodyMatch = selectFilteredPosts(
      state(
        { remote: { x: post({ id: "x", body: "A quiet cipher." }) } },
        { query: "cipher" },
      ),
    );
    expect(bodyMatch).toHaveLength(1);
  });

  it("composes category and search together", () => {
    const result = selectFilteredPosts(
      state({ remote: posts }, { category: "history", query: "stolen" }),
    );
    expect(result).toEqual([]);
  });

  it("ignores a whitespace-only query", () => {
    const result = selectFilteredPosts(state({ remote: posts }, { query: "   " }));
    expect(result).toHaveLength(3);
  });
});

describe("selectCategoryCounts", () => {
  it("counts each category and the total, reflecting deletions", () => {
    const counts = selectCategoryCounts(
      state({
        remote: {
          a: post({ id: "a", category: "history" }),
          b: post({ id: "b", category: "history" }),
          c: post({ id: "c", category: "crime" }),
          d: post({ id: "d", category: "fiction" }),
        },
        deletedIds: ["b"],
      }),
    );

    expect(counts).toEqual({ all: 3, history: 1, crime: 1, fiction: 1 });
  });
});

describe("selectRecentlyViewedPosts", () => {
  it("resolves views in order and drops ones the reader deleted", () => {
    const result = selectRecentlyViewedPosts(
      state(
        {
          remote: {
            "remote-1": post({ id: "remote-1" }),
            "remote-2": post({ id: "remote-2" }),
          },
          deletedIds: ["remote-2"],
        },
        {},
        {
          recentlyViewed: [
            { id: "remote-2", viewedAt: "2026-03-02T00:00:00.000Z" },
            { id: "remote-1", viewedAt: "2026-03-01T00:00:00.000Z" },
          ],
        },
      ),
    );

    expect(result.map((p) => p.id)).toEqual(["remote-1"]);
  });
});
