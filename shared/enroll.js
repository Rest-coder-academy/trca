// Server-side source of truth for enrolment pricing + Razorpay signature
// verification. The amount a student pays is decided HERE, never taken from the
// browser — a price posted from the client is a price the client can change.

// Course id -> price in paise. Only ids listed here can be paid online; every
// other course routes to the (free) "register interest" path. Add a course +
// price here to make it payable.
export const COURSE_PRICES = {
  fde: 5000000, // FDE — Forward Deployed Engineering — ₹50,000
  "java-fs": 3500000, // Java Full Stack — ₹35,000
  "python-fs": 3500000, // Python Full Stack — ₹35,000
  mern: 3500000, // MERN Stack — ₹35,000
};

export function priceForCourse(courseId) {
  const p = COURSE_PRICES[String(courseId || "").trim()];
  return typeof p === "number" && p > 0 ? p : null;
}

// Verify Razorpay's payment signature: HMAC-SHA256(`${order_id}|${payment_id}`)
// keyed with the account secret, compared against razorpay_signature. Done with
// Web Crypto so it runs in the Cloudflare Workers runtime.
export async function verifyRazorpaySignature(orderId, paymentId, signature, secret) {
  if (!orderId || !paymentId || !signature || !secret) return false;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const mac = await crypto.subtle.sign("HMAC", key, enc.encode(`${orderId}|${paymentId}`));
  const hex = [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, "0")).join("");
  return timingSafeEqualHex(hex, String(signature));
}

// Constant-time hex comparison — never leak how much of the signature matched.
function timingSafeEqualHex(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
