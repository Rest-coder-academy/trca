import { useEffect, useState } from "react";
import { trainers as fallbackTrainers } from "./trainers";

// Reads the live trainer profiles from /api/trainers (D1, editable at
// /admin/trainers). Falls back to the bundled `trainers` array if the request
// fails or returns nothing, so the section always renders. One shared fetch is
// cached at module level.
let cache = null;
let inflight = null;

function loadTrainers() {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = fetch("/api/trainers")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("bad response"))))
      .then((data) => {
        if (Array.isArray(data) && data.length) cache = data;
        return cache;
      })
      .catch(() => null);
  }
  return inflight;
}

export function useTrainers() {
  const [trainers, setTrainers] = useState(cache || fallbackTrainers);
  useEffect(() => {
    let cancelled = false;
    loadTrainers().then((data) => {
      if (!cancelled && data) setTrainers(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return trainers;
}
