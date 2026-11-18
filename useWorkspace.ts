"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Workspace } from "./studio";
export type SaveWorkspace = (next: Workspace) => Promise<boolean>;
export function useWorkspace(enabled = true) {
  const [data, setData] = useState<Workspace | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [reloading, setReloading] = useState(false);
  const version = useRef(0),
    busy = useRef(false);
  const fetchWorkspace = useCallback((signal?: AbortSignal) => {
    return fetch("/api/demo", {
      cache: "no-store",
      credentials: "same-origin",
      signal,
    })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok)
          throw new Error(payload.error || "Could not load the workspace.");
        if (signal?.aborted) return;
        setData(payload.data);
        setError("");
        version.current = payload.version;
      })
      .catch((cause: unknown) => {
        if (!signal?.aborted)
          setError(
            cause instanceof Error
              ? cause.message
              : "Unable to connect. Retry when you are online.",
          );
      })
      .finally(() => {
        if (!signal?.aborted) setReloading(false);
      });
  }, []);
  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    void fetchWorkspace(controller.signal);
    return () => controller.abort();
  }, [enabled, fetchWorkspace]);
  const reload = useCallback(async () => {
    setReloading(true);
    setError("");
    await fetchWorkspace();
  }, [fetchWorkspace]);
  const save: SaveWorkspace = useCallback(
    async (next) => {
      if (busy.current) return false;
      busy.current = true;
      setSaving(true);
      setError("");
      try {
        const r = await fetch("/api/demo", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ data: next, version: version.current }),
        });
        const v = await r.json();
        if (!r.ok) {
          if (r.status === 409) await reload();
          throw new Error(v.error || "Unable to save. Please retry.");
        }
        version.current = v.version;
        setData(next);
        return true;
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Unable to save. Please retry.",
        );
        return false;
      } finally {
        setSaving(false);
        busy.current = false;
      }
    },
    [reload],
  );
  return {
    data,
    error,
    setError,
    loading: reloading || (enabled && !data && !error),
    saving,
    save,
    reload,
  };
}
