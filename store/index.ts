import { configureStore } from "@reduxjs/toolkit";

import { persistListener } from "./persistMiddleware";
import engagementReducer from "./slices/engagementSlice";
import postsReducer from "./slices/postsSlice";
import uiReducer from "./slices/uiSlice";

export function makeStore() {
  return configureStore({
    reducer: {
      posts: postsReducer,
      engagement: engagementReducer,
      ui: uiReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().prepend(persistListener.middleware),
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
