"use client";

import { CATEGORIES, CATEGORY_LABELS } from "@/lib/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectCategory, selectCategoryCounts } from "@/store/selectors";
import { setCategory, type CategoryFilter as Filter } from "@/store/slices/uiSlice";

const FILTERS: readonly Filter[] = ["all", ...CATEGORIES];

const FILTER_LABELS: Record<Filter, string> = {
  all: "All",
  ...CATEGORY_LABELS,
};

export function CategoryFilter() {
  const dispatch = useAppDispatch();
  const active = useAppSelector(selectCategory);
  const counts = useAppSelector(selectCategoryCounts);

  const handleSelect = (filter: Filter) => {
    dispatch(setCategory(filter));
  };

  return (
    <div
      role="group"
      aria-label="Filter by category"
      className="flex gap-2 overflow-x-auto"
    >
      {FILTERS.map((filter) => {
        const isActive = active === filter;

        return (
          <button
            key={filter}
            type="button"
            aria-pressed={isActive}
            onClick={() => handleSelect(filter)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "border-accent bg-accent text-accent-ink"
                : "border-line text-muted hover:border-accent hover:text-ink"
            }`}
          >
            {FILTER_LABELS[filter]}
            <span className="ml-2 opacity-60">{counts[filter]}</span>
          </button>
        );
      })}
    </div>
  );
}
