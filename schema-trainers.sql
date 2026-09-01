-- Trainer profiles, editable from the /admin/trainers portal (issue: trainer credibility).
-- Powers the site's "Our Trainers" section so prospects can see who teaches the
-- course and verify their credibility (LinkedIn, experience, expertise, certificate).
CREATE TABLE IF NOT EXISTS trainers (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  name            TEXT NOT NULL,        -- full name, e.g. "Uday Pawar S"
  title           TEXT,                 -- role line, e.g. "Full-Stack Trainer"
  photo_url       TEXT,                 -- absolute URL or site path (e.g. /trainers/uday.png)
  experience      TEXT,                 -- free text, e.g. "8+ years"
  expertise       TEXT,                 -- comma-separated skills, e.g. "Java, Spring Boot, React"
  bio             TEXT,                 -- short paragraph
  linkedin_url    TEXT,
  github_url      TEXT,
  instagram_url   TEXT,
  facebook_url    TEXT,
  website_url     TEXT,
  certificate_url TEXT,                 -- link to a credential/certificate (opens in a new tab)
  sort_order      INTEGER NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'active',   -- 'active' (shown on site) | 'hidden'
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
