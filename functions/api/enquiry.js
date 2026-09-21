// POST /api/enquiry — receives the enquiry form submission and stores it in the
// Cloudflare D1 database (binding `DB`, see wrangler.toml). This replaces the old
// trcabe.onrender.com backend: it runs on Cloudflare's edge (no server to sleep,
// no cold start) and the data lands in a database we own.
export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.DB) {
    return json({ error: "storage not configured" }, 500);
  }

  let data;
  try {
    data = await request.json();
  } catch {
    return json({ error: "invalid request body" }, 400);
  }

  const fullname = str(data.fullname);
  const mobile = str(data.mobile);
  if (!fullname || !mobile) {
    return json({ error: "fullname and mobile are required" }, 400);
  }

  try {
    // The four utm_* columns are added by schema.sql in the same PR that
    // added this write. If the columns are missing on an old DB the INSERT
    // throws — that is the reason there is a fallback below: an incomplete
    // migration cannot break the enquiry flow, we just lose attribution
    // until the ALTER TABLE runs (see schema.sql for the wrangler command).
    try {
      await env.DB.prepare(
        "INSERT INTO enquiries (fullname, mobile, email, experience, message, utm_source, utm_medium, utm_campaign, utm_content) " +
          "VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)"
      )
        .bind(
          fullname,
          mobile,
          nullable(data.email),
          nullable(data.experience),
          nullable(data.message),
          nullable(data.utm_source),
          nullable(data.utm_medium),
          nullable(data.utm_campaign),
          nullable(data.utm_content)
        )
        .run();
    } catch {
      await env.DB.prepare(
        "INSERT INTO enquiries (fullname, mobile, email, experience, message) VALUES (?1, ?2, ?3, ?4, ?5)"
      )
        .bind(fullname, mobile, str(data.email), str(data.experience), str(data.message))
        .run();
    }
  } catch (err) {
    return json({ error: "could not save enquiry" }, 500);
  }

  return json({ ok: true }, 201);
}

function str(v) {
  return typeof v === "string" ? v.trim().slice(0, 2000) : "";
}

// Like str() but returns null for empty input so the DB stores NULL rather
// than an empty string. Used for the utm_* columns so an unattributed lead
// leaves the field blank instead of joining "" for aggregation queries.
function nullable(v) {
  const s = str(v);
  return s === "" ? null : s;
}

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}
