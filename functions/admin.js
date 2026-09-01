import { requireAdminAuth } from "./_shared/auth.js";

// GET /admin — password-protected lead list for the academy.
// Reads enquiries from D1 (binding `DB`) and server-renders an HTML table.
export async function onRequestGet(context) {
  const { request, env } = context;

  const auth = requireAdminAuth(request, env);
  if (!auth.ok) return auth.response;

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
  header nav { margin-left:auto; }
  header nav a { color:#fff; opacity:.8; font-size:.85rem; text-decoration:underline; }
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
  <header><h1>Enquiries</h1><span class="count">${count} total</span><nav><a href="/admin/batches">Batch dates →</a></nav></header>
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
