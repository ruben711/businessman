"use client";

const UID_KEY = "bm-uid";
const NAME_KEY = "bm-name";

export function getUid(): string {
  if (typeof window === "undefined") return "";
  let uid = localStorage.getItem(UID_KEY);
  if (!uid) {
    uid = "u_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
    localStorage.setItem(UID_KEY, uid);
  }
  return uid;
}

export function getName(): string {
  if (typeof window === "undefined") return "";
  const n = localStorage.getItem(NAME_KEY);
  if (n) return n;
  const uid = getUid();
  return "User" + (parseInt(uid.slice(-4), 36) % 10000).toString().padStart(4, "0");
}

export function setName(name: string) {
  localStorage.setItem(NAME_KEY, name);
}
