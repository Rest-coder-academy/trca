-- Student-portal user accounts (Phase 1). Populated on first Google/Microsoft
-- sign-in; the portal keys everything student-specific off `id`.
CREATE TABLE IF NOT EXISTS users (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  provider   TEXT NOT NULL,                          -- 'google' | 'microsoft'
  subject    TEXT NOT NULL,                          -- provider's stable user id ('sub')
  email      TEXT,
  name       TEXT,
  picture    TEXT,
  role       TEXT NOT NULL DEFAULT 'student',        -- 'student' | 'instructor' | 'admin'
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_login TEXT
);

-- One account per (provider, subject) — the login upsert matches on this.
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_provider_subject
  ON users (provider, subject);
