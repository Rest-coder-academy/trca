# Rest Coder Academy — website

Marketing + enquiry site for Rest Coder Academy. React (Vite) frontend, hosted
on Cloudflare with a small serverless backend for capturing leads.

## Stack at a glance

| Layer | What |
|---|---|
| Frontend | React + Vite (this repo) |
| Hosting | **Cloudflare Pages** — project `restcoder-academy` |
| Backend | **Cloudflare Pages Functions** (`functions/`) — edge serverless, nothing to sleep |
| Database | **Cloudflare D1** — `restcoder-enquiries` (stores enquiry leads) |
| Analytics | **Cloudflare Web Analytics** (automatic, no code) |

Everything runs on **one Cloudflare account** (owned by the academy). Free tier
throughout.

## Domains

- **Live:** https://restcoderacademy.in (and `www.`) — DNS managed on Cloudflare,
  domain registered at **Hostinger**.
- ⚠️ **`restcoderacademy.com` is EXPIRED / abandoned** (it lapsed at GoDaddy).
  Do not rely on it or point anything at it.

## Local development

```bash
npm install
npm run dev      # local dev server
npm run build    # production build -> dist/
```

## Deploying

Deploys are currently **manual** (push-to-deploy is a TODO — connect the repo
under Cloudflare Pages → Settings → Git to automate it):

```bash
# needs Cloudflare auth for the academy account (`wrangler login` once)
npx wrangler pages deploy --branch main
```

`wrangler.toml` holds the Pages project name, the build output dir (`dist`), and
the D1 binding — so `wrangler pages deploy` picks all of that up automatically.

## Enquiry backend (leads)

The enquiry form does **not** talk to any external server. It POSTs same-origin:

```
enquiry form  ->  POST /api/enquiry  ->  functions/api/enquiry.js  ->  D1 (enquiries table)
```

- Endpoint: `functions/api/enquiry.js` (validates + inserts into D1 via `env.DB`).
- Database: D1 `restcoder-enquiries`, table `enquiries` — see `schema.sql`.
- If the write ever fails, the form shows a **WhatsApp fallback** so a lead is
  never lost. Fallback numbers: **80737 62257** and **91104 24403**.

### Viewing the leads

- **Dashboard:** Cloudflare → Storage & Databases → D1 → `restcoder-enquiries` →
  Console → `SELECT * FROM enquiries ORDER BY created_at DESC;`
- **CLI:**
  ```bash
  npx wrangler d1 execute restcoder-enquiries --remote \
    --command "SELECT * FROM enquiries ORDER BY created_at DESC;"
  ```

(A friendly `/admin` lead-list page for the academy is a planned follow-up — see
the issues.)

### Changing the database schema

Edit `schema.sql`, then apply it:

```bash
npx wrangler d1 execute restcoder-enquiries --remote --file=schema.sql
```

## Batch schedule (admin-editable)

The **Upcoming Batches** section and the course-card "Next batch" tags read live
from D1 — the academy edits them at **`/admin/batches`** (same login as `/admin`),
no code change or redeploy.

```
site  ->  GET /api/batches          (functions/api/batches.js, public read from D1)
admin ->  /admin/batches (GET/POST)  (functions/admin/batches.js, password-protected CRUD)
```

- Table: D1 `batches` — see `schema-batches.sql`. Dates are **DD-MM-YYYY**.
- The frontend (`useBatches` hook) falls back to the bundled `batches.js` if the
  API is ever unreachable, so the section always renders.
- A past-dated batch auto-shows "new dates coming soon" on the site, so it can
  never advertise a stale date even if left unedited.

## Trainers (admin-editable)

The **Our Trainers** section on the homepage shows who teaches the courses —
photo, title, experience, expertise, a short bio, their LinkedIn/GitHub, and an
optional certificate link — so prospects can judge the trainers' credibility.
The academy edits these at **`/admin/trainers`** (same login as `/admin`), no
code change or redeploy.

```
site  ->  GET /api/trainers           (functions/api/trainers.js, public read from D1)
admin ->  /admin/trainers (GET/POST)   (functions/admin/trainers.js, password-protected CRUD)
```

- Table: D1 `trainers` — see `schema-trainers.sql`. Only **Name** is required;
  every other field is optional and simply hidden on the site when blank.
- Photos are referenced by URL. Bundled assets live under `public/trainers/`
  (e.g. `/trainers/uday.png`), or point `photo_url` at any hosted image.
- The frontend (`useTrainers` hook) falls back to the bundled `trainers.js` if
  the API is ever unreachable, so the section always renders.
- Set a trainer to **Hidden** to keep the profile but take it off the site.

## History / context

- The previous backend (`trcabe.onrender.com`) was a separate repo by the prior
  developer, on a sleeping free tier with an undocumented database and no way to
  view leads — so form submissions were silently dropped whenever it was asleep.
  It was **replaced** by the D1 + Pages Function setup above (see issues #2, #17,
  #19, #20). `trcabe.onrender.com` is no longer used.
