"use client";
import { useEffect } from "react";

/**
 * Scrolls to the given DOM id after the page renders.
 * Used by the grouped exercise viewer so clicking exercise N from the list
 * lands you directly on that exercise instead of at the top of the page.
 */
export function ScrollToExercise({ id }: { id: string }) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    // Run on the next frame so the DOM is painted
    const tick = requestAnimationFrame(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ block: "start", behavior: "auto" });
    });
    return () => cancelAnimationFrame(tick);
  }, [id]);
  return null;
}
