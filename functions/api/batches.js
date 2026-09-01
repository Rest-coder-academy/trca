// GET /api/batches — public read of active batch entries for the "Upcoming
// Batches" section and each course card's "Next batch" tag. Backed by D1
// (table `batches`), edited via the /admin/batches admin screen (issue #15).
//
// Returns [] (not an error) if D1 or the table isn't ready yet, so the
// frontend's static fallback list takes over instead of the site breaking —
// same graceful-degradation approach as the enquiry form's WhatsApp fallback.
export async function onRequestGet(context) {
  const { env } = context;

  if (!env.DB) {
    return json([], 200);
  }

  try {
    const res = await env.DB.prepare(
      "SELECT course, batch_date, time, mode, duration, trainer, contact " +
        "FROM batches WHERE status = 'active' ORDER BY batch_date ASC"
    ).all();

    const rows = (res.results || []).map((r) => {
      const { display, day } = isoToDisplay(r.batch_date);
      return {
        name: r.course,
        date: display,
        day,
        time: r.time || "",
        mode: r.mode || "",
        duration: r.duration || "",
        trainer: r.trainer || "",
        contact: r.contact || "",
      };
    });

    return json(rows, 200);
  } catch {
    return json([], 200);
  }
}

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// "YYYY-MM-DD" -> { display: "DD-MM-YYYY", day: "Wednesday" }
// The frontend's batchDateUtils.parseBatchDate expects DD-MM-YYYY, so this
// keeps the API contract matching the existing static batches.js shape.
function isoToDisplay(iso) {
  const [y, m, d] = String(iso).split("-").map(Number);
  const pad = (n) => String(n).padStart(2, "0");
  if (!y || !m || !d) {
    return { display: "", day: "" };
  }
  return {
    display: `${pad(d)}-${pad(m)}-${y}`,
    day: WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()],
  };
}

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}
