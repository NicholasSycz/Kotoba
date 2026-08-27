import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import type { RecentView } from "@/lib/types";

import { hydrate } from "../hydrate";

/** How many posts the "recently viewed" strip remembers. */
export const RECENTLY_VIEWED_LIMIT = 6;

export interface EngagementState {
  likedIds: string[];
  recentlyViewed: RecentView[];
}

const initialState: EngagementState = {
  likedIds: [],
  recentlyViewed: [],
};

const engagementSlice = createSlice({
  name: "engagement",
  initialState,
  reducers: {
    toggleLike(state, action: PayloadAction<string>) {
      const id = action.payload;
      state.likedIds = state.likedIds.includes(id)
        ? state.likedIds.filter((liked) => liked !== id)
        : [...state.likedIds, id];
    },

    recordView: {
      reducer(state, action: PayloadAction<RecentView>) {
        // Re-visiting a post moves it to the front rather than duplicating it.
        const rest = state.recentlyViewed.filter(
          (view) => view.id !== action.payload.id,
        );
        state.recentlyViewed = [action.payload, ...rest].slice(
          0,
          RECENTLY_VIEWED_LIMIT,
        );
      },
      prepare(id: string) {
        return { payload: { id, viewedAt: new Date().toISOString() } };
      },
    },

    clearRecentlyViewed(state) {
      state.recentlyViewed = [];
    },
  },

  extraReducers(builder) {
    // Merged rather than assigned, for the same reason as `postsSlice`: a like
    // or a view recorded before hydration lands must not be thrown away.
    builder.addCase(hydrate, (state, action) => {
      state.likedIds = [
        ...new Set([...action.payload.likedIds, ...state.likedIds]),
      ];

      const merged = [...state.recentlyViewed, ...action.payload.recentlyViewed]
        .sort((a, b) => b.viewedAt.localeCompare(a.viewedAt))
        .filter(
          (view, index, all) =>
            all.findIndex((other) => other.id === view.id) === index,
        );

      state.recentlyViewed = merged.slice(0, RECENTLY_VIEWED_LIMIT);
    });
  },
});

export const { toggleLike, recordView, clearRecentlyViewed } =
  engagementSlice.actions;

export default engagementSlice.reducer;
