-- Batch schedule, editable from the /admin/batches portal (issue #15).
CREATE TABLE IF NOT EXISTS batches (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,        -- course name (must match a course card to show its "Next batch" tag)
  date       TEXT NOT NULL,        -- DD-MM-YYYY
  day        TEXT,
  time       TEXT,
  trainer    TEXT,
  duration   TEXT,
  mode       TEXT,
  contact    TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
