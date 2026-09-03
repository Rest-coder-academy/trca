// Thin, defensive wrappers around GA4 (gtag.js, loaded in index.html).
//
// gtag loads async and can be absent entirely (ad-blockers, offline, the tag
// not yet parsed). Every call here is guarded and wrapped so analytics can
// NEVER break the enrolment flow — a missing/throwing gtag is a no-op.

function emit(eventName, params) {
  try {
    if (typeof window === "undefined" || typeof window.gtag !== "function")
      return false;
    window.gtag("event", eventName, params);
    return true;
  } catch {
    return false;
  }
}

// Funnel start: the student opened Razorpay Checkout for a course.
export function trackBeginCheckout({ value, courseId, courseName }) {
  return emit("begin_checkout", {
    currency: "INR",
    value: Number(value) || 0,
    items: [
      {
        item_id: courseId,
        item_name: courseName,
        price: Number(value) || 0,
        quantity: 1,
      },
    ],
  });
}

// Lead: someone gave us a way to reach them (enquiry form) or reached out
// (WhatsApp / call). `method` distinguishes the source so GA4 can show which
// channel produces leads. Fires GA4's recommended `generate_lead` event.
export function trackLead(method) {
  return emit("generate_lead", { method });
}

// Revenue: a payment was verified/confirmed by the server. transactionId is the
// Razorpay payment id (the natural unique key for de-duping conversions).
export function trackPurchase({ transactionId, value, courseId, courseName }) {
  return emit("purchase", {
    transaction_id: transactionId,
    currency: "INR",
    value: Number(value) || 0,
    items: [
      {
        item_id: courseId,
        item_name: courseName,
        price: Number(value) || 0,
        quantity: 1,
      },
    ],
  });
}
