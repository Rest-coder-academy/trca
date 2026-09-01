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
