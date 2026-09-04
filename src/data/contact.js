/**
 * The academy's contact details, in one place (#107).
 *
 * These were written out separately in Contact.jsx, FooterAddress.jsx,
 * FloatingIcons.jsx and index.html's JSON-LD, and had already drifted — the
 * footer showed the phone as a bare "8073762257" while every other surface
 * showed "+91 80737 62257". A visitor comparing the two has to wonder which
 * is right.
 *
 * index.html's structured data is static markup and still holds its own copy;
 * anything rendered by React should read from here.
 */

export const PHONE_DISPLAY = "+91 80737 62257";
export const PHONE_TEL = "+918073762257";
export const WHATSAPP = "918073762257";
// enquiry@restcoderacademy.com hard-bounces: the .com lapsed at GoDaddy and
// the .in has no MX record, so mail to it is lost silently (#130).
export const EMAIL = "restcoderacademy@gmail.com";

export const ADDRESS = {
  street: "#364, 3rd Floor, 16th Main, 4th T Block East",
  locality: "Pattabhirama Nagar, Jayanagar",
  city: "Bengaluru",
  region: "Karnataka",
  postalCode: "560041",
};

export const MAP_URL = "https://maps.app.goo.gl/XdZWt3oDzGUCL5KWA";

export const WHATSAPP_URL =
  `https://wa.me/${WHATSAPP}?text=` +
  encodeURIComponent("Hello! Can I get more info on courses and placements.");

/**
 * ⚠️ UNCONFIRMED — the academy's LinkedIn and Instagram URLs are not in this
 * repo, and #107 asks for a social row.
 *
 * Add them here and the footer renders them; leave them out and it renders
 * only the channels we can actually stand behind. They are omitted rather
 * than pointed at a guessed handle, for the same reason #9 leaves the
 * placement count empty: a dead social link in the footer of every page is
 * worse than no link.
 *
 *   { label: "LinkedIn", href: "https://www.linkedin.com/company/..." },
 */
export const SOCIAL_PROFILES = [];
