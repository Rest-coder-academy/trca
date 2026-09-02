import { useEffect, useState } from "react";

// Reads the founder / About content from /api/founder (D1, editable at
// /admin/founder). Returns { founder, loaded } — founder is {} when nothing is
// set (the About page then hides itself). Cached at module level.
let cache = null; // the founder object, or {} once we know there is none
let inflight = null;

function loadFounder() {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = fetch("/api/founder")
      .then((r) => (r.ok ? r.json() : {}))
      .then((data) => {
        cache = data && typeof data === "object" ? data : {};
        return cache;
      })
      .catch(() => {
        cache = {};
        return cache;
      });
  }
  return inflight;
}

export function useFounder() {
  const [founder, setFounder] = useState(cache || null);
  const [loaded, setLoaded] = useState(!!cache);
  useEffect(() => {
    let cancelled = false;
    loadFounder().then((data) => {
      if (!cancelled) {
        setFounder(data);
        setLoaded(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return { founder: founder || {}, loaded };
}

// True when there's a real founder to show (a name is set).
export function hasFounder(founder) {
  return !!(founder && String(founder.name || "").trim());
}
