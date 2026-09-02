# Payment gateway — design

Enrolment and payment for Rest Coder Academy, designed against this repo's own
palette (`src/styles/colors.css`) and Montserrat (`src/styles/fonts.css`).
Nothing here changes application code — it is the design for the flow before it
is built.

Canvas: https://claude.ai/code/artifact/96c5f202-1c3f-4cea-ae2f-4f40f747ebf2

| Board | What it settles |
|---|---|
| `svg/01-enrol-flow.svg` | Course card → checkout → confirmation, mobile-first |
| `svg/02-referral-attribution.svg` | How the referral code is handled, and why |
| `svg/03-open-questions.svg` | The two commercial decisions, shown both ways |
| `svg/04-build-notes.svg` | What this needs from the app that already exists |

Open any `.dc.html` in a browser to see a board without tooling. Install
**Montserrat** before opening the SVGs in Figma or the type substitutes.

## It extends the enquiry form, it does not replace it

`src/components/forms/Enquiry Form/EnquiryForm.jsx` already collects full name,
mobile, email and experience — the same fields a checkout needs, already
validated, already posting to `trcabe.onrender.com`. The checkout reuses those
atoms (`InputBoxComponent`, `ButtonComponent`) rather than introducing a second
form language into the app.

"Or talk to a counsellor first" stays on the course card. The enquiry funnel is
what converts today; payment is added beside it, not in front of it.

## The referral field is not decorative

The default pattern — "Have a coupon?" behind a disclosure link — loses the
referral on most visits. A student who was referred and never opens that link
pays in full and records as organic: the money is collected, the attribution is
not, and nothing reports an error.

So the field is **always visible**, pre-filled from `?ref=…` on landing,
persisted while the student browses, and confirmed in a green state *before*
the pay button. A code that silently fails to apply is worse than no field — it
looks handled and isn't.

The code should ride into Razorpay's `notes` on order creation, so it lands in
the payment record and can be queried rather than counted by hand.

## Two decisions still open

1. **Full fee online, or a booking deposit?** Board 03 shows both. A deposit is
   far easier to say yes to, but moves most of the fee offline.
2. **Do prices go public?** There is no pricing anywhere on the site today.
   Board 03 shows the course card with and without.

Both are a config change on this layout, not a redesign.

## Build notes

- **The amount comes from the server, never the form.** A price posted from the
  browser is a price the browser can change.
- **Verify the Razorpay signature server-side.** A redirect alone can be forged;
  the webhook signature is what makes a payment real.
- **Idempotency** — a double-tap must not create two orders. Key on enquiry +
  batch.
- **Not designed yet:** payment failure and retry, refund/cancellation copy, and
  the desktop layout (the same column, centred). Failure matters most here — on
  a payment this size it decides whether the student retries or rings a
  competitor.
