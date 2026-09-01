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
    await env.DB.prepare(
      "INSERT INTO enquiries (fullname, mobile, email, experience, message) VALUES (?1, ?2, ?3, ?4, ?5)"
    )
      .bind(fullname, mobile, str(data.email), str(data.experience), str(data.message))
      .run();
  } catch (err) {
    return json({ error: "could not save enquiry" }, 500);
  }

  return json({ ok: true }, 201);
}

function str(v) {
  return typeof v === "string" ? v.trim().slice(0, 2000) : "";
}

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}
