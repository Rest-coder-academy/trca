// GET /api/trainers — public. Returns the active trainer profiles from D1 so the
// site's "Our Trainers" section shows real, verifiable trainers (photo, title,
// experience, expertise, LinkedIn, certificate) — edited at /admin/trainers with
// no code change or redeploy.
// Fails soft: on any error returns [] and the frontend falls back to its bundled
// default trainer so the section always renders.
export async function onRequestGet(context) {
  const { env } = context;
  if (!env.DB) return json([]);
  try {
    const { results } = await env.DB.prepare(
      "SELECT id, name, title, photo_url, experience, expertise, bio, " +
        "linkedin_url, github_url, instagram_url, facebook_url, website_url, certificate_url " +
        "FROM trainers WHERE status = 'active' ORDER BY sort_order ASC, id ASC"
    ).all();
    return json(results || []);
  } catch {
    return json([]);
  }
}

function json(body) {
  return new Response(JSON.stringify(body), {
    headers: {
      "content-type": "application/json",
      "cache-control": "public, max-age=60",
    },
  });
}
