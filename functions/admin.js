import { requireAdminAuth } from "./_shared/auth.js";
import { ADMIN_STYLES } from "./_shared/adminStyles.js";

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
    `<td><a class="link" href="tel:${esc(r.mobile)}">${esc(r.mobile)}</a></td>` +
    `<td>${r.email ? `<a class="link" href="mailto:${esc(r.email)}">${esc(r.email)}</a>` : "—"}</td>` +
    `<td>${esc(r.experience) || "—"}</td>` +
    `<td class="msg">${esc(r.message) || "—"}</td>` +
    `<td class="muted">${esc(r.created_at)}</td>` +
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
${ADMIN_STYLES}
  .msg { max-width:340px; }
</style></head>
<body>
  <header class="admin-header"><h1>Enquiries</h1><span class="count">${count} total</span><nav><a href="/admin/batches">Batch dates →</a></nav></header>
  <div class="admin-wrap">
    ${notice ? `<div class="notice">${esc(notice)}</div>` : ""}
    <div class="scroll">
      <table class="admin-table">
        <thead><tr><th>Name</th><th>Mobile</th><th>Email</th><th>Experience</th><th>Message</th><th>Received</th></tr></thead>
        <tbody>${body}</tbody>
      </table>
    </div>
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
