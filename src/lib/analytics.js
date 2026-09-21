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

// Same defensive shape as emit(), but for Meta Pixel. Missing fbq is a no-op.
function emitFbq(action, eventName, params) {
  try {
    if (typeof window === "undefined" || typeof window.fbq !== "function")
      return false;
    window.fbq(action, eventName, params);
    return true;
  } catch {
    return false;
  }
}

// Google Ads conversion — a specific gtag event shape. The conversion label
// pairs with the Ads conversion ID configured in tracking-init.js, and the
// `send_to` string is what the Ads UI generates when the action is created.
// Configured via env so preview builds do not fire against the real account.
const GOOGLE_ADS_LEAD_CONVERSION = import.meta.env.VITE_GOOGLE_ADS_LEAD_CONVERSION;
function emitGoogleAdsLead(value) {
  if (!GOOGLE_ADS_LEAD_CONVERSION) return false;
  return emit("conversion", {
    send_to: GOOGLE_ADS_LEAD_CONVERSION,
    currency: "INR",
    value: Number(value) || 0,
  });
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
// channel produces leads. Fires GA4's recommended `generate_lead` event,
// plus Meta Pixel's `Lead` event and Google Ads' lead conversion when the
// paid-ads pixel + conversion IDs are configured.
//
// value defaults to the AI-FDE program price so paid-campaign ROAS numbers
// come out right; callers can pass a different figure for cheaper courses.
export function trackLead(method, value = 50000) {
  const okGa = emit("generate_lead", { method, currency: "INR", value });
  emitFbq("track", "Lead", {
    content_name: method,
    currency: "INR",
    value,
  });
  emitGoogleAdsLead(value);
  return okGa;
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
