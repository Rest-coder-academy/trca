// Ads-pixel initialisation. GA4's gtag is already loaded from index.html and
// runs regardless of paid ads. This file adds two more pixels — Meta and
// Google Ads — that only turn on when their IDs are configured in Vite env,
// so a preview build or a local dev boot never accidentally reports fake ad
// events against the real accounts.
//
// Both are wired defensively: a missing ID is a silent no-op, and every call
// site (see analytics.js) checks `typeof window.fbq === "function"` before
// firing an event. That matches the pattern GA4 has followed for months —
// analytics MUST NEVER break the enrolment flow.

const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID;
const GOOGLE_ADS_ID = import.meta.env.VITE_GOOGLE_ADS_ID;

let initialised = false;

export function initTracking() {
  if (initialised) return;
  if (typeof window === "undefined") return;
  initialised = true;

  if (META_PIXEL_ID) {
    installMetaPixel(META_PIXEL_ID);
  }

  // GA4's gtag was loaded synchronously from index.html; if a Google Ads
  // conversion ID is set, register it as a second gtag target so the
  // conversion events fired from analytics.js reach both properties.
  if (GOOGLE_ADS_ID && typeof window.gtag === "function") {
    window.gtag("config", GOOGLE_ADS_ID);
  }
}

// Standard Meta Pixel base code, verbatim from Meta's install guide. Only the
// pixel ID is variable. Runs the base initialisation then fires PageView so
// audience matching starts from the first render.
function installMetaPixel(pixelId) {
  /* eslint-disable */
  !(function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(
    window,
    document,
    "script",
    "https://connect.facebook.net/en_US/fbevents.js"
  );
  /* eslint-enable */
  window.fbq("init", pixelId);
  window.fbq("track", "PageView");
}
