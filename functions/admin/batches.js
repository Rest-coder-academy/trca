import { requireAdminAuth } from "../_shared/auth.js";

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
          <button type="submit">Save</button>
        </form>
      </details>
      <form method="post" class="delete-form">
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
  :root { --navy:#03084C; --line:#e4e6ef; --muted:#5b6472; --green:#0f9d58; --red:#c0392b; }
  * { box-sizing:border-box; }
  body { margin:0; font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif; color:#1b2030; background:#f5f6fa; }
  header { background:var(--navy); color:#fff; padding:1rem 1.25rem; display:flex; align-items:baseline; gap:.75rem; }
  header h1 { font-size:1.1rem; margin:0; }
  header nav { margin-left:auto; }
  header nav a { color:#fff; opacity:.8; font-size:.85rem; text-decoration:underline; }
  .wrap { padding:1.25rem; overflow-x:auto; }
  table { border-collapse:collapse; width:100%; min-width:900px; background:#fff; border:1px solid var(--line); border-radius:10px; overflow:hidden; }
  th,td { text-align:left; padding:.6rem .8rem; border-bottom:1px solid var(--line); vertical-align:top; font-size:.9rem; }
  th { background:#eef0f6; color:var(--navy); font-weight:600; white-space:nowrap; }
  tr:last-child td { border-bottom:none; }
  .muted { color:var(--muted); font-size:.8rem; }
  .empty { text-align:center; color:var(--muted); padding:2rem; }
  .notice { padding:1rem 1.25rem; color:var(--red); }
  .badge { padding:.15rem .6rem; border-radius:999px; font-size:.75rem; font-weight:600; }
  .badge.active { background:#e6f4ea; color:var(--green); }
  .badge.hidden { background:#f1e6e6; color:var(--red); }
  .actions { white-space:nowrap; }
  .actions form { margin-top:.4rem; }
  .actions .edit-form label { display:block; margin-top:.4rem; font-size:.8rem; }
  .actions .edit-form input, .actions .edit-form select { width:100%; padding:.3rem; margin-top:.15rem; }
  button { cursor:pointer; padding:.3rem .7rem; border-radius:6px; border:1px solid var(--line); background:#fff; }
  button.danger { color:var(--red); border-color:var(--red); }
  .add-batch { margin-top:1.5rem; background:#fff; border:1px solid var(--line); border-radius:10px; padding:1rem; max-width:420px; }
  .add-batch h2 { margin:0 0 .3rem; font-size:1rem; }
  .add-batch label { display:block; margin-top:.6rem; font-size:.85rem; }
  .add-batch input, .add-batch select { width:100%; padding:.4rem; margin-top:.2rem; }
  .add-batch button { margin-top:1rem; background:var(--navy); color:#fff; border:none; padding:.5rem 1rem; }
</style></head>
<body>
  <header><h1>Batch Dates</h1><nav><a href="/admin">Enquiries →</a></nav></header>
  ${notice ? `<div class="notice">${esc(notice)}</div>` : ""}
  <div class="wrap">
    <table>
      <thead><tr><th>Course</th><th>Date</th><th>Time</th><th>Mode</th><th>Duration</th><th>Trainer</th><th>Contact</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>${body}</tbody>
    </table>

    <form method="post" class="add-batch">
      <h2>Add a new batch</h2>
      <input type="hidden" name="action" value="create"/>
      <label>Course <input name="course" required placeholder="e.g. Java Full Stack"/></label>
      <label>Date <input type="date" name="batch_date" required/></label>
      <label>Time <input name="time" placeholder="e.g. 10:00 AM"/></label>
      <label>Mode <select name="mode">${modeOptions("offline")}</select></label>
      <label>Duration <input name="duration" placeholder="e.g. 4 months"/></label>
      <label>Trainer <input name="trainer" placeholder="e.g. Uday pawar S"/></label>
      <label>Contact <input name="contact" placeholder="e.g. 8073762257"/></label>
      <label>Status <select name="status">${statusOptions("active")}</select></label>
      <button type="submit">Add batch</button>
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
