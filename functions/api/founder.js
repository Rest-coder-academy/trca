// GET /api/founder — public. Returns the founder/About content from D1 (edited at
// /admin/founder). Returns {} when there's no active founder set, so the site
// hides the About page entirely until Uday's team fills it in.
// Fails soft: any error → {}.
export async function onRequestGet(context) {
  const { env } = context;
  if (!env.DB) return json({});
  try {
    const row = await env.DB.prepare(
      "SELECT name, title, tagline, intro, story, mission, vision, photo_url, linkedin_url " +
        "FROM founder WHERE id = 1 AND status = 'active'"
    ).first();
    // Hidden, unset, or blank name → treat as "no founder page".
    if (!row || !String(row.name || "").trim()) return json({});
    return json(row);
  } catch {
    return json({});
  }
}

function json(body) {
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json", "cache-control": "public, max-age=60" },
  });
}
