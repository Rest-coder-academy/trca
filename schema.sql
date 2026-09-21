-- Enquiry leads captured from the site's enquiry form.
-- Applied to the Cloudflare D1 database `restcoder-enquiries`.
CREATE TABLE IF NOT EXISTS enquiries (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  fullname     TEXT NOT NULL,
  mobile       TEXT NOT NULL,
  email        TEXT,
  experience   TEXT,
  message      TEXT,
  -- Attribution captured from URL query string when the enquiry landed.
  -- Every ad click carries these, so filling them lets us tell which channel
  -- (meta / google / linkedin / referral) produced which paid enrolment.
  utm_source   TEXT,
  utm_medium   TEXT,
  utm_campaign TEXT,
  utm_content  TEXT,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Existing databases need these columns added manually — SQLite has no
-- IF NOT EXISTS on ALTER TABLE ADD COLUMN, so this is idempotent by hand:
--   wrangler d1 execute restcoder-enquiries --remote --command \
--     "ALTER TABLE enquiries ADD COLUMN utm_source   TEXT;"
--   wrangler d1 execute restcoder-enquiries --remote --command \
--     "ALTER TABLE enquiries ADD COLUMN utm_medium   TEXT;"
--   wrangler d1 execute restcoder-enquiries --remote --command \
--     "ALTER TABLE enquiries ADD COLUMN utm_campaign TEXT;"
--   wrangler d1 execute restcoder-enquiries --remote --command \
--     "ALTER TABLE enquiries ADD COLUMN utm_content  TEXT;"
-- Run once against production before shipping this PR. The endpoint tolerates
-- the columns being missing (writes NULL) so an incomplete migration cannot
-- break the enquiry flow, but analytics is only useful once they exist.

CREATE INDEX IF NOT EXISTS idx_enquiries_created_at ON enquiries (created_at);
