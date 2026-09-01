// Shared HTTP Basic Auth guard for admin-only Pages Functions routes.
// Auth: against the `ADMIN_PASSWORD` Pages secret (user = ADMIN_USER or "admin").
// Fails CLOSED — if ADMIN_PASSWORD isn't set, nobody gets in.
//
// Files under _shared/ are not routable by Cloudflare Pages Functions (the
// leading underscore excludes them), so this is safe to import without
// creating a stray route.
export function requireAdminAuth(request, env) {
  const challenge = () =>
    new Response("Authentication required.", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Rest Coder Academy — Admin", charset="UTF-8"',
        "content-type": "text/plain; charset=utf-8",
      },
    });

  if (!env.ADMIN_PASSWORD) return { ok: false, response: challenge() };

  const header = request.headers.get("Authorization") || "";
  if (!header.startsWith("Basic ")) return { ok: false, response: challenge() };

  let user = "", pass = "";
  try {
    const decoded = atob(header.slice(6));
    const i = decoded.indexOf(":");
    user = decoded.slice(0, i);
    pass = decoded.slice(i + 1);
  } catch {
    return { ok: false, response: challenge() };
  }

  const expectedUser = env.ADMIN_USER || "admin";
  if (!safeEqual(user, expectedUser) || !safeEqual(pass, env.ADMIN_PASSWORD)) {
    return { ok: false, response: challenge() };
  }

  return { ok: true };
}

// Constant-time-ish string compare to avoid leaking the password via timing.
function safeEqual(a, b) {
  a = String(a);
  b = String(b);
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
