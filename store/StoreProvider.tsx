"use client";

import { useEffect, useState } from "react";
import { Provider } from "react-redux";

import { loadState } from "@/lib/storage";

import { hydrate } from "./hydrate";
import { makeStore } from "./index";
import { loadSeedPosts } from "./slices/postsSlice";

export function StoreProvider({ children }: { children: React.ReactNode }) {

  const [store] = useState(makeStore);

  useEffect(() => {
    store.dispatch(hydrate(loadState()));

    if (store.getState().posts.status === "idle") {
      store.dispatch(loadSeedPosts());
    }
  }, [store]);

  return <Provider store={store}>{children}</Provider>;
}
