// GET /api/batches — public. Returns the batch schedule from D1 so the site's
// Batches section and the course-card "Next batch" tags read live data that the
// academy edits from /admin/batches (no code change, no redeploy).
// Fails soft: on any error returns [] and the frontend falls back to its bundled defaults.
export async function onRequestGet(context) {
  const { env } = context;
  if (!env.DB) return json([]);
  try {
    const { results } = await env.DB.prepare(
      "SELECT id, name, date, day, time, trainer, duration, mode, contact " +
        "FROM batches ORDER BY sort_order ASC, date ASC"
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
