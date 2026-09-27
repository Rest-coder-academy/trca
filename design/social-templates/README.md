# Social templates

The recurring graphics RCA publishes, as source you can diff.

| Template | File | Used for |
|---|---|---|
| Placement Testimonial | `templates/placement-testimonial.js` | every placement announcement |
| Festival Greeting | `templates/festival-greeting.js` | Ugadi, Deepavali, Sankranti, … |
| Batch / Course Launch | `templates/batch-launch.js` | new batch and course posts |
| Teaching Moment | `templates/teaching-moment.js` | mid-week "one thing this cohort learned" posts (#296) |

## Why these live here

Ticket #151: every historical placement announcement, festival greeting and
batch launch carries `www.restcoderacademy.com` as its URL watermark. That
domain is dead — the registration lapsed and the `.in` is the live site. Anyone
who screenshots a post, or reads the URL off a phone and types it later, hits
nothing.

The templates only ever existed inside a design tool, so the wrong URL was
invisible to the repo, unfixable without opening the master file, and printed
identically onto three years of posts. Moving them here makes the domain one
line in `brand.js` and the next correction a one-word diff that CI can check.

This is **not** a re-brand. Colours come from `design/tokens.css`, the layouts
are transcribed from the existing graphics, and nothing was redesigned. #151
asked for a string swap; this is the machinery that keeps it swapped.

## Change the URL, a phone number, the colours

Edit `brand.js`. That is the only file with the domain in it — the templates
call `watermark()` and never write it themselves, so a change cannot land on
two graphics and miss the third.

```bash
node design/social-templates/tools/build.mjs           # rebuild out/*.svg
node design/social-templates/tools/build.mjs --png     # + 1080×1080 PNG proofs
node design/social-templates/tools/build.mjs --check   # fail if a dead URL is back
```

`out/*.svg` is committed because it diffs — a review shows exactly what moved
on the graphic. `out/*.png` is not: it needs a browser, and it is only for
eyeballing a proof before a post goes out.

## Make a post

Templates take data; the defaults are a worked example.

```js
import { render } from "./templates/placement-testimonial.js";

const svg = render({
  name: "Sakshi Rao",
  designation: "Associate Engineer",
  company: "Wipro",
  yop: "2025",
  salary: "₹5.2 LPA",
  quote: "…",
  college: "RV College of Engineering",
});
```

Every field is optional — a missing salary collapses the badge rather than
leaving an empty box, and long text wraps and truncates instead of running off
the canvas. Drop the real photograph into the dashed `PHOTO` slot in any
editor; the composition around it is already final.

## Teaching moment

```js
import { render } from "./templates/teaching-moment.js";

const svg = render({
  concept: "Recursion is a function calling itself",
  expansion: "It is how tree walks and JSON parsers work: solve the small case, then trust the call.",
  cohort: "Java Full Stack Batch 12",
  variant: "ig", // or "linkedin"
});
```

Unlike the other templates it throws instead of truncating: a clipped
definition is a wrong definition. The concept steps down from 72px to 56px to
fit three lines and the expansion from 32px to 28px to fit two; past that,
`render()` names the field to shorten. It also throws on the playbook's banned
phrases (`BANNED` in the template), and for `variant: "linkedin"` on emoji or
non-Latin script. Kanglish in Latin letters passes the check — that is still a
review call.

It has several samples, so the build writes `out/teaching-moment-<key>.svg`
per sample instead of one `out/teaching-moment.svg`. The cohort names in the
samples are placeholders.

## Canvas

1080×1080, Instagram's feed post. Stories and Reel covers crop from the
centre, which is why nothing meaningful sits in the outer 96px.

## What is deliberately not here

- **Old posts are not re-generated.** Historical Instagram and LinkedIn posts
  stay exactly as published. Going back to edit them reads as brand-panic and
  resets the engagement on each one. Only the templates are fixed, so the next
  post is right.
- **No QR code, no `https://` prefix.** Both were considered in #151 and ruled
  out: the existing graphics print a bare domain, and a QR is a new visual
  affordance, not a correction.
- **No `www.`** — Cloudflare 301s www→apex (#15), so printing it sends every
  prospect through a pointless redirect.
