import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import type { Category, Theme } from "@/lib/types";

import { hydrate } from "../hydrate";

export type CategoryFilter = Category | "all";

export interface UndoToast {
  id: string;
  postId: string;
  title: string;
}

export interface UiState {
  category: CategoryFilter;
  query: string;
  theme: Theme;
  undoToast: UndoToast | null;
  /**
   * False until persisted state has been read. Components that render
   * reader-owned data wait on this so the server-rendered markup and the first
   * client render agree — see `store/StoreProvider.tsx`.
   */
  hydrated: boolean;
}

const initialState: UiState = {
  category: "all",
  query: "",
  theme: "system",
  undoToast: null,
  hydrated: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setCategory(state, action: PayloadAction<CategoryFilter>) {
      state.category = action.payload;
    },
    setQuery(state, action: PayloadAction<string>) {
      state.query = action.payload;
    },
    clearFilters(state) {
      state.category = "all";
      state.query = "";
    },
    setTheme(state, action: PayloadAction<Theme>) {
      state.theme = action.payload;
    },
    showUndoToast(
      state,
      action: PayloadAction<{ postId: string; title: string }>,
    ) {
      state.undoToast = {
        id: `${action.payload.postId}-${Date.now()}`,
        postId: action.payload.postId,
        title: action.payload.title,
      };
    },
    dismissUndoToast(state, action: PayloadAction<string | undefined>) {
      if (!action.payload || state.undoToast?.id === action.payload) {
        state.undoToast = null;
      }
    },
  },

  extraReducers(builder) {
    builder.addCase(hydrate, (state, action) => {
      state.theme = action.payload.theme;
      state.hydrated = true;
    });
  },
});

export const {
  setCategory,
  setQuery,
  clearFilters,
  setTheme,
  showUndoToast,
  dismissUndoToast,
} = uiSlice.actions;

export default uiSlice.reducer;
