import { requireAdminAuth } from "../_shared/auth.js";
import { ADMIN_STYLES } from "../_shared/adminStyles.js";

// GET/POST /admin/batches — password-protected screen for RCA to add, edit,
// or hide batch entries without a code change (issue #15). Reads/writes D1
// (table `batches`); the public /api/batches endpoint serves the same rows
// to the site. Plain HTML forms, no client JS framework — POST redirects
// back to GET (303) so a page refresh can't resubmit a mutation.

export async function onRequestGet(context) {
  const { request, env } = context;

  const auth = requireAdminAuth(request, env);
  if (!auth.ok) return auth.response;

  if (!env.DB) {
    return html(page({ notice: "Storage not configured.", rows: [] }), 500);
  }

  const rows = await listBatches(env);
  return html(page({ rows }), 200);
}

export async function onRequestPost(context) {
  const { request, env } = context;

  const auth = requireAdminAuth(request, env);
  if (!auth.ok) return auth.response;

  if (!env.DB) {
    return html(page({ notice: "Storage not configured.", rows: [] }), 500);
  }

  let form;
  try {
    form = await request.formData();
  } catch {
    return html(page({ notice: "Invalid form submission.", rows: await listBatches(env) }), 400);
  }

  const action = str(form.get("action"));

  try {
    if (action === "create") {
      await env.DB.prepare(
        "INSERT INTO batches (course, batch_date, time, mode, duration, trainer, contact, status) " +
          "VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)"
      )
        .bind(...fieldsFrom(form), statusFrom(form))
        .run();
    } else if (action === "update") {
      const id = Number(form.get("id"));
      if (id) {
        await env.DB.prepare(
          "UPDATE batches SET course=?1, batch_date=?2, time=?3, mode=?4, duration=?5, trainer=?6, " +
            "contact=?7, status=?8, updated_at=datetime('now') WHERE id=?9"
        )
          .bind(...fieldsFrom(form), statusFrom(form), id)
          .run();
      }
    } else if (action === "delete") {
      const id = Number(form.get("id"));
      if (id) {
        await env.DB.prepare("DELETE FROM batches WHERE id=?1").bind(id).run();
      }
    }
  } catch {
    return html(page({ notice: "Could not save changes.", rows: await listBatches(env) }), 500);
  }

  return Response.redirect(new URL("/admin/batches", request.url), 303);
}

function fieldsFrom(form) {
  return [
    str(form.get("course")),
    str(form.get("batch_date")),
    str(form.get("time")),
    str(form.get("mode")),
    str(form.get("duration")),
    str(form.get("trainer")),
    str(form.get("contact")),
  ];
}

function statusFrom(form) {
  return str(form.get("status")) || "active";
}

async function listBatches(env) {
  try {
    const res = await env.DB.prepare(
      "SELECT id, course, batch_date, time, mode, duration, trainer, contact, status " +
        "FROM batches ORDER BY batch_date ASC"
    ).all();
    return res.results || [];
  } catch {
    return [];
  }
}

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function dayOf(iso) {
  const [y, m, d] = String(iso || "").split("-").map(Number);
  if (!y || !m || !d) return "";
  return WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
}

function modeOptions(selected) {
  return ["offline", "online", "hybrid"]
    .map((m) => `<option value="${m}" ${m === selected ? "selected" : ""}>${m}</option>`)
    .join("");
}

function statusOptions(selected) {
  return ["active", "hidden"]
    .map((s) => `<option value="${s}" ${s === selected ? "selected" : ""}>${s}</option>`)
    .join("");
}

function rowHtml(r) {
  return `<tr>
    <td>${esc(r.course)}</td>
    <td>${esc(r.batch_date)}<br/><span class="muted">${dayOf(r.batch_date)}</span></td>
    <td>${esc(r.time) || "—"}</td>
    <td>${esc(r.mode) || "—"}</td>
    <td>${esc(r.duration) || "—"}</td>
    <td>${esc(r.trainer) || "—"}</td>
    <td>${esc(r.contact) || "—"}</td>
    <td>${r.status === "active" ? '<span class="badge active">active</span>' : '<span class="badge hidden">hidden</span>'}</td>
    <td class="actions">
      <details>
        <summary>Edit</summary>
        <form method="post" class="edit-form">
          <input type="hidden" name="action" value="update"/>
          <input type="hidden" name="id" value="${r.id}"/>
          <label>Course <input name="course" value="${esc(r.course)}" required/></label>
          <label>Date <input type="date" name="batch_date" value="${esc(r.batch_date)}" required/></label>
          <label>Time <input name="time" value="${esc(r.time || "")}"/></label>
          <label>Mode <select name="mode">${modeOptions(r.mode)}</select></label>
          <label>Duration <input name="duration" value="${esc(r.duration || "")}"/></label>
          <label>Trainer <input name="trainer" value="${esc(r.trainer || "")}"/></label>
          <label>Contact <input name="contact" value="${esc(r.contact || "")}"/></label>
          <label>Status <select name="status">${statusOptions(r.status)}</select></label>
          <button type="submit" class="primary">Save</button>
        </form>
      </details>
      <form method="post" class="delete-form" onsubmit="return confirm('Delete this batch entry? This cannot be undone.')">
        <input type="hidden" name="action" value="delete"/>
        <input type="hidden" name="id" value="${r.id}"/>
        <button type="submit" class="danger">Delete</button>
      </form>
    </td>
  </tr>`;
}

function page({ notice, rows }) {
  const body = rows.length
    ? rows.map(rowHtml).join("")
    : `<tr><td colspan="9" class="empty">No batches yet — add one below.</td></tr>`;

  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<meta name="robots" content="noindex, nofollow"/>
<title>Batch Dates — Rest Coder Academy</title>
<style>
${ADMIN_STYLES}
  .actions { white-space:nowrap; }
  .actions details { position:relative; display:inline-block; }
  .actions summary { cursor:pointer; color:var(--navy); font-size:.82rem; font-weight:600; list-style:none; padding:.35rem .7rem; border:1px solid var(--line); border-radius:7px; }
  .actions summary::-webkit-details-marker { display:none; }
  .actions details[open] summary { background:#eef0f6; }
  .actions .edit-form { position:absolute; right:0; top:calc(100% + .4rem); z-index:20; background:#fff; border:1px solid var(--line); border-radius:12px; box-shadow:0 14px 34px rgba(3,8,76,.2); padding:1rem; width:260px; text-align:left; }
  .actions .edit-form label { display:block; margin-top:.5rem; font-size:.78rem; color:var(--muted); font-weight:600; }
  .actions .edit-form input, .actions .edit-form select { width:100%; padding:.4rem; margin-top:.2rem; border:1px solid var(--line); border-radius:6px; font-size:.85rem; }
  .actions .edit-form button { margin-top:.8rem; width:100%; }
  .actions .delete-form { display:inline-block; margin-left:.4rem; }
  .add-batch { margin-top:1.75rem; background:#fff; border:1px solid var(--line); border-radius:12px; padding:1.5rem; box-shadow:0 6px 24px rgba(3,8,76,.08); max-width:640px; }
  .add-batch h2 { margin:0 0 1rem; font-size:1.05rem; color:var(--navy); }
  .add-batch .grid { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
  .add-batch label { display:block; font-size:.82rem; color:var(--muted); font-weight:600; }
  .add-batch input, .add-batch select { width:100%; padding:.55rem .6rem; margin-top:.3rem; border:1px solid var(--line); border-radius:7px; font-size:.9rem; }
  .add-batch input:focus, .add-batch select:focus { outline:none; border-color:var(--navy); box-shadow:0 0 0 3px rgba(3,8,76,.1); }
  .add-batch button { margin-top:1.25rem; }
  @media (max-width: 560px) {
    .add-batch .grid { grid-template-columns:1fr; }
  }
</style></head>
<body>
  <header class="admin-header"><h1>Batch Dates</h1><nav><a href="/admin">Enquiries →</a></nav></header>
  <div class="admin-wrap">
    ${notice ? `<div class="notice">${esc(notice)}</div>` : ""}
    <div class="scroll">
      <table class="admin-table">
        <thead><tr><th>Course</th><th>Date</th><th>Time</th><th>Mode</th><th>Duration</th><th>Trainer</th><th>Contact</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>${body}</tbody>
      </table>
    </div>

    <form method="post" class="add-batch">
      <h2>Add a new batch</h2>
      <input type="hidden" name="action" value="create"/>
      <div class="grid">
        <label>Course <input name="course" required placeholder="e.g. Java Full Stack"/></label>
        <label>Date <input type="date" name="batch_date" required/></label>
        <label>Time <input name="time" placeholder="e.g. 10:00 AM"/></label>
        <label>Mode <select name="mode">${modeOptions("offline")}</select></label>
        <label>Duration <input name="duration" placeholder="e.g. 4 months"/></label>
        <label>Trainer <input name="trainer" placeholder="e.g. Uday pawar S"/></label>
        <label>Contact <input name="contact" placeholder="e.g. 8073762257"/></label>
        <label>Status <select name="status">${statusOptions("active")}</select></label>
      </div>
      <button type="submit" class="primary">Add batch</button>
    </form>
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

function str(v) {
  return typeof v === "string" ? v.trim().slice(0, 500) : "";
}

function html(bodyStr, status) {
  return new Response(bodyStr, { status, headers: { "content-type": "text/html; charset=utf-8" } });
}
