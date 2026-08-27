"use client";

import { useEffect, useRef, useState } from "react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectQuery } from "@/store/selectors";
import { setQuery } from "@/store/slices/uiSlice";

const DEBOUNCE_MS = 250;

export function SearchBar() {
  const dispatch = useAppDispatch();
  const storeQuery = useAppSelector(selectQuery);
  const [value, setValue] = useState(storeQuery);
  const [lastStoreQuery, setLastStoreQuery] = useState(storeQuery);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  if (storeQuery !== lastStoreQuery) {
    setLastStoreQuery(storeQuery);
    setValue(storeQuery);
  }

  useEffect(() => {
    return () => clearTimeout(timer.current);
  }, []);

  const handleChange = (next: string) => {
    setValue(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      dispatch(setQuery(next));
    }, DEBOUNCE_MS);
  };

  return (
    <div className="relative w-full sm:max-w-sm">
      <label htmlFor="post-search" className="sr-only">
        Search posts
      </label>
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <input
        id="post-search"
        type="search"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Search posts"
        className="w-full rounded-md border border-line bg-surface py-2 pl-9 pr-3 text-sm text-ink placeholder:text-muted"
      />
    </div>
  );
}
