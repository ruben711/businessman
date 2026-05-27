"use client";

export type Theme = "light" | "dark";

export function getTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const s = localStorage.getItem("bm-theme");
  if (s === "light" || s === "dark") return s;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function setTheme(t: Theme) {
  localStorage.setItem("bm-theme", t);
  document.documentElement.classList.remove("light", "dark");
  document.documentElement.classList.add(t);
}

export function toggleTheme(): Theme {
  const next: Theme = getTheme() === "dark" ? "light" : "dark";
  setTheme(next);
  return next;
}
