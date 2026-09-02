// POST /api/enroll/verify — verifies a completed Razorpay payment SERVER-SIDE
// (a browser redirect/callback alone can be forged) and records the paid
// enrolment. Idempotent: a retried verify for the same order does not create a
// second row.
import { priceForCourse, verifyRazorpaySignature } from "../../../shared/enroll.js";

export async function onRequestPost(context) {
  const { request, env } = context;
  const keySecret = env.RAZORPAY_KEY_SECRET;
  if (!keySecret) return json({ error: "Payments are not enabled yet." }, 503);
  if (!env.DB) return json({ error: "Storage not configured." }, 500);

  let b;
  try {
    b = await request.json();
  } catch {
    return json({ error: "Bad request." }, 400);
  }

  const orderId = String(b.razorpay_order_id || "");
  const paymentId = String(b.razorpay_payment_id || "");
  const signature = String(b.razorpay_signature || "");

  const valid = await verifyRazorpaySignature(orderId, paymentId, signature, keySecret);
  if (!valid) return json({ error: "Payment could not be verified." }, 400);

  const courseId = String(b.course || "").trim();
  const amount = priceForCourse(courseId);

  // There is no form on our side — the student enters their phone + email in
  // Razorpay Checkout — so pull those from the verified payment. Any values in
  // the body are only a fallback. Best-effort: the payment is already verified,
  // so a failed lookup must never fail the student.
  let email = str(b.email);
  let mobile = str(b.mobile);
  if (env.RAZORPAY_KEY_ID && keySecret) {
    try {
      const pr = await fetch(
        `https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`,
        { headers: { Authorization: "Basic " + btoa(`${env.RAZORPAY_KEY_ID}:${keySecret}`) } }
      );
      if (pr.ok) {
        const p = await pr.json();
        if (p.email) email = str(p.email);
        if (p.contact) mobile = str(p.contact);
      }
    } catch {
      /* keep the fallbacks */
    }
  }

  try {
    const existing = await env.DB.prepare(
      "SELECT id FROM enrollments WHERE razorpay_order_id = ?1"
    )
      .bind(orderId)
      .first();
    if (!existing) {
      await env.DB.prepare(
        "INSERT INTO enrollments (fullname, mobile, email, experience, course, course_name, batch, referral, amount, currency, razorpay_order_id, razorpay_payment_id, status) " +
          "VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,'INR',?10,?11,'paid')"
      )
        .bind(
          str(b.fullname), mobile, email, str(b.experience),
          courseId, str(b.course_name), str(b.batch), str(b.referral),
          amount || null, orderId, paymentId
        )
        .run();
    }
  } catch {
    // The payment IS verified — never fail the student because our write hiccupped.
    return json({ ok: true, recorded: false });
  }
  return json({ ok: true, recorded: true });
}

const str = (v) => String(v || "").trim().slice(0, 300);

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}
