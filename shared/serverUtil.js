// Pure helpers shared by the Pages Functions. Kept outside functions/ so it's a
// plain importable module (not a route) and can be unit-tested directly.

// HTML-escape untrusted values before rendering into admin pages (lead messages,
// batch fields are user/attacker-controlled — this prevents stored XSS).
export function escapeHtml(v) {
  return String(v == null ? "" : v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// A real calendar date in DD-MM-YYYY. Rejects wrong shape, out-of-range parts,
// and rollover dates (e.g. "31-04-2026" that JS would silently roll to 1 May).
export function isValidBatchDate(s) {
  const parts = String(s).split("-").map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return false;
  const [d, m, y] = parts;
  if (y < 1000 || y > 9999 || m < 1 || m > 12 || d < 1 || d > 31) return false;
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
}

// Derive the weekday name from a DD-MM-YYYY date, so the day shown on the site is
// always computed from the date and can't drift out of sync with it. "" if invalid.
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export function weekdayFromDate(s) {
  if (!isValidBatchDate(s)) return "";
  const [d, m, y] = String(s).split("-").map(Number);
  return WEEKDAYS[new Date(y, m - 1, d).getDay()];
}

// Length-independent early-out plus constant-time compare of equal-length strings,
// so a wrong admin password can't be discovered by timing.
export function safeEqual(a, b) {
  a = String(a);
  b = String(b);
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// Parse an "Authorization: Basic base64(user:pass)" header. Returns {user, pass}
// or null if absent/malformed. The first ":" splits user from pass (passwords may
// contain ":").
export function parseBasicAuth(header) {
  if (!header || !header.startsWith("Basic ")) return null;
  let decoded;
  try {
    decoded = atob(header.slice(6));
  } catch {
    return null;
  }
  const i = decoded.indexOf(":");
  if (i < 0) return null;
  return { user: decoded.slice(0, i), pass: decoded.slice(i + 1) };
}

export function basicAuthChallenge() {
  return new Response("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Rest Coder Academy Admin", charset="UTF-8"' },
  });
}

// Returns null when the request is authenticated, or a 401 challenge Response
// otherwise. Fails CLOSED: no ADMIN_PASSWORD configured => nobody gets in.
export function requireAdminAuth(request, env) {
  if (!env.ADMIN_PASSWORD) return basicAuthChallenge();
  const creds = parseBasicAuth(request.headers.get("Authorization") || "");
  if (!creds) return basicAuthChallenge();
  const okUser = safeEqual(creds.user, env.ADMIN_USER || "admin");
  const okPass = safeEqual(creds.pass, env.ADMIN_PASSWORD);
  return okUser && okPass ? null : basicAuthChallenge();
}
