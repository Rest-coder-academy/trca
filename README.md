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

- **Web:** `/admin` — a password-protected lead-list page (see below).

### Changing the database schema

Edit `schema.sql`, then apply it:

```bash
npx wrangler d1 execute restcoder-enquiries --remote --file=schema.sql
```

## Batch dates (admin-controlled)

RCA updates upcoming batch dates themselves, with no code change or redeploy
(see issue #15):

```
Batches section  ->  GET /api/batches   ->  functions/api/batches.js  ->  D1 (batches table)
/admin/batches   ->  add / edit / hide  ->  functions/admin/batches.js -> D1 (batches table)
```

- Public read: `GET /api/batches` — returns active batch entries as JSON,
  consumed by the "Upcoming Batches" section and each course card's "Next
  batch" tag.
- Admin screen: `/admin/batches` — same auth as `/admin` (see below); add,
  edit, or hide a batch entry with plain HTML forms.
- If the D1 table is empty or the request fails, the frontend falls back to
  the static list in `src/components/organism/Batches/batches.js` so the
  site never breaks — same graceful-degradation approach as the enquiry
  form's WhatsApp fallback.
- A batch whose date has passed is never shown as upcoming: the UI renders
  "Batch closed" / "New dates coming soon" and switches the CTA to "Join the
  Waitlist" (see issue #3).

## Admin screens (`/admin`, `/admin/batches`)

Both are password-protected with HTTP Basic Auth, gated by the `ADMIN_PASSWORD`
Pages secret (`ADMIN_USER` optional, defaults to `admin`). Fails **closed** —
if `ADMIN_PASSWORD` isn't set, nobody gets in.

```bash
# set once per environment, from the Cloudflare dashboard or:
npx wrangler pages secret put ADMIN_PASSWORD
```

- `/admin` — enquiry leads (read-only).
- `/admin/batches` — batch dates (add / edit / hide).

## History / context

- The previous backend (`trcabe.onrender.com`) was a separate repo by the prior
  developer, on a sleeping free tier with an undocumented database and no way to
  view leads — so form submissions were silently dropped whenever it was asleep.
  It was **replaced** by the D1 + Pages Function setup above (see issues #2, #17,
  #19, #20). `trcabe.onrender.com` is no longer used.
