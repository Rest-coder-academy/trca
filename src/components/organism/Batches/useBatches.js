import { useEffect, useState } from "react";
import { batches as fallbackBatches } from "./batches";

// Reads the live batch schedule from /api/batches (D1, editable at /admin/batches).
// Falls back to the bundled `batches` array if the request fails, so the section
// always renders. One shared fetch is cached at module level so the Batches
// section and every course card don't each hit the network.
let cache = null;
let inflight = null;

function loadBatches() {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = fetch("/api/batches")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("bad response"))))
      .then((data) => {
        if (Array.isArray(data) && data.length) cache = data;
        return cache;
      })
      .catch(() => null);
  }
  return inflight;
}

export function useBatches() {
  const [batches, setBatches] = useState(cache || fallbackBatches);
  useEffect(() => {
    let cancelled = false;
    loadBatches().then((data) => {
      if (!cancelled && data) setBatches(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return batches;
}
