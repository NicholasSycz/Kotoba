"use client";

import { useEffect } from "react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { restorePost } from "@/store/slices/postsSlice";
import { dismissUndoToast } from "@/store/slices/uiSlice";

const TOAST_TIMEOUT_MS = 8000;

export function ToastHost() {
  const dispatch = useAppDispatch();
  const toast = useAppSelector((state) => state.ui.undoToast);

  useEffect(() => {
    if (!toast) return;

    const timeout = window.setTimeout(() => {
      dispatch(dismissUndoToast(toast.id));
    }, TOAST_TIMEOUT_MS);

    return () => window.clearTimeout(timeout);
  }, [dispatch, toast]);

  if (!toast) return null;

  const handleUndo = () => {
    dispatch(restorePost(toast.postId));
    dispatch(dismissUndoToast(toast.id));
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 left-1/2 z-30 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-lg border border-line bg-surface p-4 shadow-lg sm:right-5 sm:left-auto sm:w-full sm:translate-x-0"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-medium text-ink">Post deleted</p>
          <p className="mt-1 truncate text-sm text-muted">{toast.title}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={handleUndo}
            className="rounded-full bg-accent px-3 py-1.5 text-sm font-medium text-accent-ink transition-opacity hover:opacity-90"
          >
            Undo
          </button>
          <button
            type="button"
            onClick={() => dispatch(dismissUndoToast(toast.id))}
            aria-label="Dismiss"
            className="rounded-full border border-line px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:border-accent hover:text-ink"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
