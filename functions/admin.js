// GET /admin — password-protected lead list for the academy.
// Reads enquiries from D1 (binding `DB`) and server-renders an HTML table.
// Auth: HTTP Basic Auth against the `ADMIN_PASSWORD` Pages secret (user = ADMIN_USER
// or "admin"). Fails CLOSED — if ADMIN_PASSWORD isn't set, nobody gets in.
export async function onRequestGet(context) {
  const { request, env } = context;

  const challenge = () =>
    new Response("Authentication required.", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Rest Coder Academy — Admin", charset="UTF-8"',
        "content-type": "text/plain; charset=utf-8",
      },
    });

  // Fail closed if no password is configured.
  if (!env.ADMIN_PASSWORD) return challenge();

  const header = request.headers.get("Authorization") || "";
  if (!header.startsWith("Basic ")) return challenge();

  let user = "", pass = "";
  try {
    const decoded = atob(header.slice(6));
    const i = decoded.indexOf(":");
    user = decoded.slice(0, i);
    pass = decoded.slice(i + 1);
  } catch {
    return challenge();
  }

  const expectedUser = env.ADMIN_USER || "admin";
  if (!safeEqual(user, expectedUser) || !safeEqual(pass, env.ADMIN_PASSWORD)) {
    return challenge();
  }

  if (!env.DB) {
    return html(page("Storage not configured.", 0, ""), 500);
  }

  let rows = [];
  try {
    const res = await env.DB.prepare(
      "SELECT id, fullname, mobile, email, experience, message, created_at " +
        "FROM enquiries ORDER BY created_at DESC"
    ).all();
    rows = res.results || [];
  } catch {
    return html(page("Could not load enquiries.", 0, ""), 500);
  }

  const body = rows.length
    ? rows.map(rowHtml).join("")
    : `<tr><td colspan="6" class="empty">No enquiries yet.</td></tr>`;

  return html(page(null, rows.length, body), 200);
}

function rowHtml(r) {
  return (
    "<tr>" +
    `<td>${esc(r.fullname)}</td>` +
    `<td><a href="tel:${esc(r.mobile)}">${esc(r.mobile)}</a></td>` +
    `<td>${r.email ? `<a href="mailto:${esc(r.email)}">${esc(r.email)}</a>` : "—"}</td>` +
    `<td>${esc(r.experience) || "—"}</td>` +
    `<td class="msg">${esc(r.message) || "—"}</td>` +
    `<td class="when">${esc(r.created_at)}</td>` +
    "</tr>"
  );
}

function page(notice, count, body) {
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<meta name="robots" content="noindex, nofollow"/>
<title>Enquiries — Rest Coder Academy</title>
<style>
  :root { --navy:#03084C; --line:#e4e6ef; --muted:#5b6472; }
  * { box-sizing:border-box; }
  body { margin:0; font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif; color:#1b2030; background:#f5f6fa; }
  header { background:var(--navy); color:#fff; padding:1rem 1.25rem; display:flex; align-items:baseline; gap:.75rem; }
  header h1 { font-size:1.1rem; margin:0; }
  header .count { font-size:.85rem; opacity:.8; }
  header a { color:#cdd6ea; font-size:.85rem; margin-left:.5rem; }
  .wrap { padding:1.25rem; overflow-x:auto; }
  table { border-collapse:collapse; width:100%; min-width:760px; background:#fff; border:1px solid var(--line); border-radius:10px; overflow:hidden; }
  th,td { text-align:left; padding:.6rem .8rem; border-bottom:1px solid var(--line); vertical-align:top; font-size:.9rem; }
  th { background:#eef0f6; color:var(--navy); font-weight:600; white-space:nowrap; }
  tr:last-child td { border-bottom:none; }
  a { color:var(--navy); }
  .msg { max-width:340px; }
  .when { white-space:nowrap; color:var(--muted); }
  .empty { text-align:center; color:var(--muted); padding:2rem; }
  .notice { padding:1rem 1.25rem; color:#b3261e; }
</style></head>
<body>
  <header><h1>Enquiries</h1><span class="count">${count} total</span><a href="/admin/batches">Batches →</a></header>
  ${notice ? `<div class="notice">${esc(notice)}</div>` : ""}
  <div class="wrap">
    <table>
      <thead><tr><th>Name</th><th>Mobile</th><th>Email</th><th>Experience</th><th>Message</th><th>Received</th></tr></thead>
      <tbody>${body}</tbody>
    </table>
  </div>
</body></html>`;
}

function esc(v) {
  return String(v == null ? "" : v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function html(bodyStr, status) {
  return new Response(bodyStr, { status, headers: { "content-type": "text/html; charset=utf-8" } });
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
