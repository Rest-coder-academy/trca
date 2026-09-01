// POST /api/enroll/order — creates a Razorpay order SERVER-SIDE for a paid
// course (currently FDE). The amount is looked up on the server from the course
// id; it is never read from the request body. Returns the order id + the public
// key id the browser needs to open Razorpay Checkout. The secret never leaves
// the server.
//
// Inert until keys exist: with no RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET secrets,
// it returns 503 so the frontend can show "enrolment opening soon" instead of
// a broken checkout.
import { priceForCourse } from "../../../shared/enroll.js";

export async function onRequestPost(context) {
  const { request, env } = context;
  const keyId = env.RAZORPAY_KEY_ID;
  const keySecret = env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return json({ error: "Payments are not enabled yet." }, 503);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Bad request." }, 400);
  }

  const courseId = String(body.course || "").trim();
  const amount = priceForCourse(courseId); // paise, server-decided
  if (!amount) return json({ error: "This course isn't available for online payment." }, 400);

  const referral = String(body.referral || "").trim().slice(0, 120);

  let res;
  try {
    res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: "Basic " + btoa(`${keyId}:${keySecret}`),
      },
      body: JSON.stringify({
        amount,
        currency: "INR",
        receipt: `${courseId}_${Date.now()}`,
        notes: { course: courseId, referral },
      }),
    });
  } catch {
    return json({ error: "Could not reach the payment gateway. Please try again." }, 502);
  }
  if (!res.ok) return json({ error: "Could not start payment. Please try again." }, 502);

  const order = await res.json();
  return json({ orderId: order.id, amount, currency: "INR", keyId });
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}
