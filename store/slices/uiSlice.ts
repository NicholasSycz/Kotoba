import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import type { Category, Theme } from "@/lib/types";

import { hydrate } from "../hydrate";

export type CategoryFilter = Category | "all";

export interface UiState {
  category: CategoryFilter;
  query: string;
  theme: Theme;
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
  },

  extraReducers(builder) {
    builder.addCase(hydrate, (state, action) => {
      state.theme = action.payload.theme;
      state.hydrated = true;
    });
  },
});

export const { setCategory, setQuery, clearFilters, setTheme } =
  uiSlice.actions;

export default uiSlice.reducer;
