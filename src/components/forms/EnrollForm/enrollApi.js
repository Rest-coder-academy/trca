// Client helpers for the enrolment flow. All money logic lives on the server
// (functions/api/enroll/*); these just move data to/from it and load Razorpay
// Checkout. The amount is never sent from here — the server decides it.

const REF_KEY = "rca_ref";

// Capture ?ref= once and remember it while the visitor browses, so a referral
// isn't lost if they don't enrol on the first page they land on.
export function getReferral() {
  try {
    const url = new URL(window.location.href);
    const ref = url.searchParams.get("ref");
    if (ref) localStorage.setItem(REF_KEY, ref.slice(0, 120));
    return localStorage.getItem(REF_KEY) || "";
  } catch {
    return "";
  }
}

// Inject Razorpay Checkout once, on demand (not on every page load).
let razorpayPromise = null;
export function loadRazorpay() {
  if (typeof window !== "undefined" && window.Razorpay) return Promise.resolve(true);
  if (razorpayPromise) return razorpayPromise;
  razorpayPromise = new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
  return razorpayPromise;
}

async function postJson(url, data) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(data),
  });
  let body = {};
  try {
    body = (await res.json()) || {};
  } catch {
    /* non-JSON response */
  }
  return { ok: res.ok, status: res.status, body };
}

export function createOrder(courseId, referral) {
  return postJson("/api/enroll/order", { course: courseId, referral });
}
export function verifyPayment(payload) {
  return postJson("/api/enroll/verify", payload);
}
export function registerInterest(data) {
  return postJson("/api/enroll/register", data);
}
