"use client";
import { useSyncExternalStore } from "react";

const hashSubscribe = (onChange: () => void) => {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
};
export function useModuleHash() {
  return useSyncExternalStore(
    hashSubscribe,
    () => window.location.hash.slice(1),
    () => "overview",
  );
}

const preferenceKey = "ms-sidebar-collapsed";
const preferenceEvent = "ms:sidebar-preference";
let sessionPreference = false;
const readCollapsed = () => {
  try {
    const value = localStorage.getItem(preferenceKey);
    return value === null ? sessionPreference : value === "true";
  } catch {
    return sessionPreference;
  }
};
const subscribeCollapsed = (onChange: () => void) => {
  window.addEventListener(preferenceEvent, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(preferenceEvent, onChange);
    window.removeEventListener("storage", onChange);
  };
};
export function useSidebarPreference() {
  const collapsed = useSyncExternalStore(
    subscribeCollapsed,
    readCollapsed,
    () => false,
  );
  const toggle = () => {
    sessionPreference = !readCollapsed();
    try {
      localStorage.setItem(preferenceKey, String(sessionPreference));
    } catch {
      /* Keep the toggle working when browser storage is unavailable. */
    }
    window.dispatchEvent(new Event(preferenceEvent));
  };
  return [collapsed, toggle] as const;
}
