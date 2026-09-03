-- Founder / About content, edited at /admin/founder (no code change, no redeploy).
-- A single row (id = 1). The public site fetches it from /api/founder and hides
-- the About page entirely until a name is set (same "fill it in yourself, empty
-- doesn't show" model as trainers).
CREATE TABLE IF NOT EXISTS founder (
  id         INTEGER PRIMARY KEY,          -- always 1
  name       TEXT NOT NULL DEFAULT '',     -- page is hidden while this is empty
  title      TEXT NOT NULL DEFAULT '',     -- e.g. "Founder", "Founder & Lead Trainer"
  tagline    TEXT NOT NULL DEFAULT '',     -- the big headline (H1)
  intro      TEXT NOT NULL DEFAULT '',     -- short hero paragraph
  story      TEXT NOT NULL DEFAULT '',     -- the main narrative; blank lines = new paragraphs
  mission    TEXT NOT NULL DEFAULT '',
  vision     TEXT NOT NULL DEFAULT '',
  photo_url  TEXT NOT NULL DEFAULT '',
  linkedin_url TEXT NOT NULL DEFAULT '',
  status     TEXT NOT NULL DEFAULT 'active', -- 'active' shows the page, 'hidden' takes it down
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Seed the single empty row so the admin editor always has something to edit.
INSERT OR IGNORE INTO founder (id, name) VALUES (1, '');
