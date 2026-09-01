// Shared look for the admin screens (/admin, /admin/batches) so they read as
// one cohesive area instead of two independently-styled pages. Plain CSS,
// no build step — these are server-rendered HTML strings, not React.
export const ADMIN_STYLES = `
  :root { --navy:#03084C; --navy-2:#0b1660; --line:#e4e6ef; --muted:#5b6472; --green:#0f9d58; --red:#c0392b; --bg:#f5f6fa; }
  * { box-sizing:border-box; }
  body { margin:0; font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif; color:#1b2030; background:var(--bg); }
  header.admin-header { background:linear-gradient(120deg,var(--navy),var(--navy-2)); color:#fff; padding:1.1rem 1.5rem; display:flex; align-items:baseline; gap:.75rem; box-shadow:0 2px 10px rgba(3,8,76,.15); }
  header.admin-header h1 { font-size:1.15rem; margin:0; font-weight:600; letter-spacing:.01em; }
  header.admin-header .count { font-size:.85rem; opacity:.75; }
  header.admin-header nav { margin-left:auto; }
  header.admin-header nav a { color:#fff; opacity:.85; font-size:.82rem; text-decoration:none; padding:.35rem .75rem; border-radius:6px; background:rgba(255,255,255,.12); transition:background .15s ease,opacity .15s ease; }
  header.admin-header nav a:hover { opacity:1; background:rgba(255,255,255,.22); }
  .admin-wrap { max-width:1100px; margin:0 auto; padding:1.75rem 1.25rem 3rem; }
  .admin-wrap .scroll { overflow-x:auto; border-radius:12px; }
  table.admin-table { border-collapse:collapse; width:100%; min-width:760px; background:#fff; border:1px solid var(--line); border-radius:12px; overflow:hidden; box-shadow:0 6px 24px rgba(3,8,76,.08); }
  table.admin-table th, table.admin-table td { text-align:left; padding:.7rem .9rem; border-bottom:1px solid var(--line); vertical-align:top; font-size:.88rem; }
  table.admin-table th { background:#eef0f6; color:var(--navy); font-weight:600; white-space:nowrap; }
  table.admin-table tr:last-child td { border-bottom:none; }
  table.admin-table tbody tr:hover { background:#f8f9fd; }
  .muted { color:var(--muted); font-size:.8rem; }
  .empty { text-align:center; color:var(--muted); padding:2.5rem; }
  .notice { margin:0 0 1.25rem; padding:.75rem 1rem; color:var(--red); background:#fdecea; border:1px solid #f1b5ac; border-radius:8px; font-size:.9rem; }
  .badge { padding:.2rem .65rem; border-radius:999px; font-size:.75rem; font-weight:600; }
  .badge.active { background:#e6f4ea; color:var(--green); }
  .badge.hidden { background:#f1e6e6; color:var(--red); }
  a.link { color:var(--navy); }
  button { cursor:pointer; padding:.4rem .85rem; border-radius:7px; border:1px solid var(--line); background:#fff; font-size:.85rem; transition:background .15s ease; }
  button:hover { background:#f2f3f8; }
  button.primary { background:var(--navy); color:#fff; border:none; }
  button.primary:hover { background:var(--navy-2); }
  button.danger { color:var(--red); border-color:var(--red); }
  button.danger:hover { background:#fdecea; }
`
