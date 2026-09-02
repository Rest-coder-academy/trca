// POST /api/enroll/register — records a free "register interest" enrolment for a
// course that isn't priced for online payment yet (Java / Python / MERN). Same
// fields as a paid enrolment, status='registered', no payment. The academy
// follows up from /admin/enrollments.
export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.DB) return json({ error: "Storage not configured." }, 500);

  let b;
  try {
    b = await request.json();
  } catch {
    return json({ error: "Bad request." }, 400);
  }

  const fullname = str(b.fullname);
  const mobile = str(b.mobile);
  const email = str(b.email);
  // Low-friction enrolment: phone + email is all we require (name is optional —
  // collected at payment). We need at least one way to reach them.
  if (!mobile || !email) return json({ error: "Phone and email are required." }, 400);

  try {
    await env.DB.prepare(
      "INSERT INTO enrollments (fullname, mobile, email, experience, course, course_name, batch, referral, status) " +
        "VALUES (?1,?2,?3,?4,?5,?6,?7,?8,'registered')"
    )
      .bind(
        fullname, mobile, email, str(b.experience),
        str(b.course), str(b.course_name), str(b.batch), str(b.referral)
      )
      .run();
    return json({ ok: true }, 201);
  } catch {
    return json({ error: "Could not register. Please try again." }, 500);
  }
}

const str = (v) => String(v || "").trim().slice(0, 300);

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}
