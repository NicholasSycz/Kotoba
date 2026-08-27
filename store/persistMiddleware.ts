import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";

import { saveState } from "@/lib/storage";

import {
  clearRecentlyViewed,
  recordView,
  toggleLike,
} from "./slices/engagementSlice";
import {
  createPost,
  deletePost,
  restorePost,
  updatePost,
} from "./slices/postsSlice";
import { setTheme } from "./slices/uiSlice";
import type { AppDispatch, RootState } from "./index";

/** Coalescing window for writes, so a burst of actions costs one serialization. */
const WRITE_DELAY_MS = 300;

export const persistListener = createListenerMiddleware();

const startAppListening = persistListener.startListening.withTypes<
  RootState,
  AppDispatch
>();

const persistTriggers = isAnyOf(
  createPost,
  updatePost,
  deletePost,
  restorePost,
  toggleLike,
  recordView,
  clearRecentlyViewed,
  setTheme,
);

startAppListening({
  matcher: persistTriggers,
  async effect(_action, api) {
    api.cancelActiveListeners();
    await api.delay(WRITE_DELAY_MS);

    const state = api.getState();

    // Writing before hydration would overwrite good stored data with the empty
    // initial state. Nothing should reach storage until we've read from it.
    if (!state.ui.hydrated) return;

    saveState({
      local: state.posts.local,
      edits: state.posts.edits,
      deletedIds: state.posts.deletedIds,
      likedIds: state.engagement.likedIds,
      recentlyViewed: state.engagement.recentlyViewed,
      theme: state.ui.theme,
    });
  },
});
