"use client";

import { useEffect } from "react";

import type { Theme } from "@/lib/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectHydrated, selectTheme } from "@/store/selectors";
import { setTheme } from "@/store/slices/uiSlice";

const NEXT_THEME: Record<Theme, Theme> = {
  system: "high-contrast",
  "high-contrast": "dark",
  dark: "system",
};

const LABEL: Record<Theme, string> = {
  system: "System",
  "high-contrast": "High contrast",
  dark: "Dark",
};

function Icon({ theme }: { theme: Theme }) {
  if (theme === "high-contrast") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden className="size-4" fill="currentColor">
        <circle cx="12" cy="12" r="4.2" />
        <path
          d="M12 2v2.6M12 19.4V22M4.9 4.9l1.9 1.9M17.2 17.2l1.9 1.9M2 12h2.6M19.4 12H22M4.9 19.1l1.9-1.9M17.2 6.8l1.9-1.9"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (theme === "dark") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden className="size-4" fill="currentColor">
        <path d="M20 14.2A8.2 8.2 0 1 1 9.8 4a6.6 6.6 0 0 0 10.2 10.2Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-4" fill="none">
      <rect
        x="3"
        y="4.5"
        width="18"
        height="13"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="M8.5 20.5h7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function ThemeToggle() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector(selectTheme);
  const hydrated = useAppSelector(selectHydrated);

  useEffect(() => {
    if (!hydrated) return;

    const root = document.documentElement;
    if (theme === "system") {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", theme);
    }
  }, [hydrated, theme]);

  return (
    <button
      type="button"
      onClick={() => dispatch(setTheme(NEXT_THEME[theme]))}
      className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-sm text-muted transition-colors hover:border-accent hover:text-accent"
      aria-label={`Theme: ${LABEL[theme]}. Switch to ${LABEL[NEXT_THEME[theme]]}.`}
    >
      <Icon theme={theme} />
      <span className="hidden sm:inline">{LABEL[theme]}</span>
    </button>
  );
}
