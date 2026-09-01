-- Enquiry leads captured from the site's enquiry form.
-- Applied to the Cloudflare D1 database `restcoder-enquiries`.
CREATE TABLE IF NOT EXISTS enquiries (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  fullname   TEXT NOT NULL,
  mobile     TEXT NOT NULL,
  email      TEXT,
  experience TEXT,
  message    TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_enquiries_created_at ON enquiries (created_at);

-- Batch entries for the "Upcoming Batches" section (see issue #15).
-- Admin-editable via /admin/batches so RCA can update dates without a
-- code change or redeploy. Read publicly via GET /api/batches.
CREATE TABLE IF NOT EXISTS batches (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  course     TEXT NOT NULL,
  batch_date TEXT NOT NULL, -- ISO YYYY-MM-DD
  time       TEXT,
  mode       TEXT,
  duration   TEXT,
  trainer    TEXT,
  contact    TEXT,
  status     TEXT NOT NULL DEFAULT 'active', -- 'active' | 'hidden'
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_batches_status_date ON batches (status, batch_date);
