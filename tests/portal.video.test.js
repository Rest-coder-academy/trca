// Tests for GET /api/portal/lessons/:lessonId/video (#187).
// Covers: auth, enrolment check, missing video_url, range request handling,
// R2 errors, and the getLessonForStream DB helper.
import { describe, it, expect } from "vitest";
import { onRequestGet as videoGet, onRequestOptions as videoOptions } from "../functions/api/portal/lessons/[lessonId]/video.js";
import { getLessonForStream } from "../shared/courses.js";
import { signSession } from "../shared/auth.js";

const SECRET = "test-secret-value";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function fakeDB(plan = [], log = []) {
  return {
    log,
    prepare(sql) {
      const stmt = {
        _sql: sql,
        _args: [],
        bind(...args) { stmt._args = args; return stmt; },
        async first() {
          log.push({ sql, args: stmt._args });
          const rows = resolve(plan, sql, stmt._args);
          return rows && rows.length ? rows[0] : null;
        },
        async all() {
          log.push({ sql, args: stmt._args });
          return { results: resolve(plan, sql, stmt._args) ?? [] };
        },
        async run() { return { meta: { changes: 1 } }; },
      };
      return stmt;
    },
  };
}
function resolve(plan, sql, args) {
  for (const [needle, rows] of plan) {
    if (sql.toLowerCase().includes(needle.toLowerCase())) {
      return typeof rows === "function" ? rows(args) : rows;
    }
  }
  return [];
}

const throwingDB = () => ({
  prepare() {
    return { bind: () => ({ first: async () => { throw new Error("d1 down"); } }) };
  },
});

const token = (uid = 7) => signSession({ uid, email: "s@test.com", name: "S", role: "student" }, SECRET);
const req = (url, t, extra = {}) =>
  new Request(url, {
    headers: {
      ...(t ? { cookie: `rca_session=${t}` } : {}),
      ...extra,
    },
  });

const LESSON = { id: 5, title: "Intro to Java", video_url: "lessons/5.mp4" };

// Fake R2 bucket
function fakeR2(opts = {}) {
  const { object = null, throws = false } = opts;
  return {
    async get(key, rangeOpts) {
      if (throws) throw new Error("r2 error");
      if (!object) return null;
      // Simulate R2 range response
      if (rangeOpts?.range) {
        const r = rangeOpts.range;
        let offset, length;
        if (r.suffix !== undefined) {
          // Suffix form: last N bytes
          offset = object.size - r.suffix;
          length = r.suffix;
        } else {
          offset = r.offset ?? 0;
          length = r.length ?? (object.size - offset);
        }
        return {
          body: object.body,
          size: object.size,
          range: { offset, length },
        };
      }
      return object;
    },
  };
}

const r2Object = { body: new ReadableStream(), size: 10_000_000 };

// ---------------------------------------------------------------------------
// getLessonForStream — DB helper
// ---------------------------------------------------------------------------
describe("getLessonForStream", () => {
  it("returns lesson when enrolled, course published, lesson published", async () => {
    const db = fakeDB([["enrolments_users", [LESSON]]]);
    const result = await getLessonForStream(db, 7, 5);
    expect(result).toEqual(LESSON);
  });

  it("returns null when not enrolled (empty result)", async () => {
    const db = fakeDB([["enrolments_users", []]]);
    expect(await getLessonForStream(db, 7, 5)).toBeNull();
  });

  it("passes userId and lessonId as bind args", async () => {
    const log = [];
    const db = fakeDB([["enrolments_users", [LESSON]]], log);
    await getLessonForStream(db, 99, 42);
    expect(log[0].args).toEqual([99, 42]);
  });

  it("query filters on c.published = 1 and l.published = 1", async () => {
    const log = [];
    const db = fakeDB([["enrolments_users", [LESSON]]], log);
    await getLessonForStream(db, 7, 5);
    expect(log[0].sql.toLowerCase()).toContain("c.published = 1");
    expect(log[0].sql.toLowerCase()).toContain("l.published = 1");
  });
});

// ---------------------------------------------------------------------------
// GET /api/portal/lessons/:lessonId/video — auth + enrolment
// ---------------------------------------------------------------------------
describe("GET /api/portal/lessons/:id/video — auth", () => {
  it("returns 401 without session", async () => {
    const db = fakeDB();
    const res = await videoGet({
      request: req("https://x/api/portal/lessons/5/video"),
      env: { DB: db, SESSION_SECRET: SECRET, LESSONS: fakeR2({ object: r2Object }) },
      params: { lessonId: "5" },
    });
    expect(res.status).toBe(401);
  });

  it("returns 503 when DB not configured", async () => {
    const t = await token();
    const res = await videoGet({
      request: req("https://x/api/portal/lessons/5/video", t),
      env: { SESSION_SECRET: SECRET, LESSONS: fakeR2({ object: r2Object }) },
      params: { lessonId: "5" },
    });
    expect(res.status).toBe(503);
  });

  it("returns 404 for unknown or unenrolled lesson", async () => {
    const t = await token();
    const db = fakeDB([["enrolments_users", []]]);
    const res = await videoGet({
      request: req("https://x/api/portal/lessons/5/video", t),
      env: { DB: db, SESSION_SECRET: SECRET, LESSONS: fakeR2({ object: r2Object }) },
      params: { lessonId: "5" },
    });
    expect(res.status).toBe(404);
  });

  it("returns 404 when lesson has no video_url yet", async () => {
    const t = await token();
    const db = fakeDB([["enrolments_users", [{ ...LESSON, video_url: null }]]]);
    const res = await videoGet({
      request: req("https://x/api/portal/lessons/5/video", t),
      env: { DB: db, SESSION_SECRET: SECRET, LESSONS: fakeR2({ object: r2Object }) },
      params: { lessonId: "5" },
    });
    expect(res.status).toBe(404);
  });

  it("returns 503 when LESSONS binding missing", async () => {
    const t = await token();
    const db = fakeDB([["enrolments_users", [LESSON]]]);
    const res = await videoGet({
      request: req("https://x/api/portal/lessons/5/video", t),
      env: { DB: db, SESSION_SECRET: SECRET },
      params: { lessonId: "5" },
    });
    expect(res.status).toBe(503);
  });

  it("returns 503 when DB throws", async () => {
    const t = await token();
    const res = await videoGet({
      request: req("https://x/api/portal/lessons/5/video", t),
      env: { DB: throwingDB(), SESSION_SECRET: SECRET, LESSONS: fakeR2({ object: r2Object }) },
      params: { lessonId: "5" },
    });
    expect(res.status).toBe(503);
  });

  it("returns 503 when R2 throws", async () => {
    const t = await token();
    const db = fakeDB([["enrolments_users", [LESSON]]]);
    const res = await videoGet({
      request: req("https://x/api/portal/lessons/5/video", t),
      env: { DB: db, SESSION_SECRET: SECRET, LESSONS: fakeR2({ throws: true }) },
      params: { lessonId: "5" },
    });
    expect(res.status).toBe(503);
  });

  it("returns 404 when R2 object is missing (video_url in DB but object deleted)", async () => {
    const t = await token();
    const db = fakeDB([["enrolments_users", [LESSON]]]);
    const res = await videoGet({
      request: req("https://x/api/portal/lessons/5/video", t),
      env: { DB: db, SESSION_SECRET: SECRET, LESSONS: fakeR2({ object: null }) },
      params: { lessonId: "5" },
    });
    expect(res.status).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// GET — full video (no Range header)
// ---------------------------------------------------------------------------
describe("GET /api/portal/lessons/:id/video — full response", () => {
  it("returns 200 with Content-Type video/mp4 and Content-Length", async () => {
    const t = await token();
    const db = fakeDB([["enrolments_users", [LESSON]]]);
    const res = await videoGet({
      request: req("https://x/api/portal/lessons/5/video", t),
      env: { DB: db, SESSION_SECRET: SECRET, LESSONS: fakeR2({ object: r2Object }) },
      params: { lessonId: "5" },
    });
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("video/mp4");
    expect(res.headers.get("Content-Length")).toBe("10000000");
    expect(res.headers.get("Accept-Ranges")).toBe("bytes");
    expect(res.headers.get("Cache-Control")).toBe("private, no-store");
  });
});

// ---------------------------------------------------------------------------
// GET — range requests
// ---------------------------------------------------------------------------
describe("GET /api/portal/lessons/:id/video — range requests", () => {
  it("returns 206 for Range: bytes=0-999", async () => {
    const t = await token();
    const db = fakeDB([["enrolments_users", [LESSON]]]);
    const res = await videoGet({
      request: req("https://x/api/portal/lessons/5/video", t, { Range: "bytes=0-999" }),
      env: { DB: db, SESSION_SECRET: SECRET, LESSONS: fakeR2({ object: r2Object }) },
      params: { lessonId: "5" },
    });
    expect(res.status).toBe(206);
    expect(res.headers.get("Content-Range")).toMatch(/^bytes 0-999\/10000000$/);
    expect(res.headers.get("Content-Length")).toBe("1000");
    expect(res.headers.get("Accept-Ranges")).toBe("bytes");
  });

  it("returns 206 for open-ended Range: bytes=500-", async () => {
    const t = await token();
    const db = fakeDB([["enrolments_users", [LESSON]]]);
    const res = await videoGet({
      request: req("https://x/api/portal/lessons/5/video", t, { Range: "bytes=500-" }),
      env: { DB: db, SESSION_SECRET: SECRET, LESSONS: fakeR2({ object: r2Object }) },
      params: { lessonId: "5" },
    });
    expect(res.status).toBe(206);
  });

  it("returns 416 for malformed Range header", async () => {
    const t = await token();
    const db = fakeDB([["enrolments_users", [LESSON]]]);
    const res = await videoGet({
      request: req("https://x/api/portal/lessons/5/video", t, { Range: "bytes=abc" }),
      env: { DB: db, SESSION_SECRET: SECRET, LESSONS: fakeR2({ object: r2Object }) },
      params: { lessonId: "5" },
    });
    expect(res.status).toBe(416);
  });

  it("returns 416 for inverted range bytes=500-100", async () => {
    const t = await token();
    const db = fakeDB([["enrolments_users", [LESSON]]]);
    const res = await videoGet({
      request: req("https://x/api/portal/lessons/5/video", t, { Range: "bytes=500-100" }),
      env: { DB: db, SESSION_SECRET: SECRET, LESSONS: fakeR2({ object: r2Object }) },
      params: { lessonId: "5" },
    });
    expect(res.status).toBe(416);
  });

  it("returns 206 for suffix range bytes=-500", async () => {
    const t = await token();
    const db = fakeDB([["enrolments_users", [LESSON]]]);
    const res = await videoGet({
      request: req("https://x/api/portal/lessons/5/video", t, { Range: "bytes=-500" }),
      env: { DB: db, SESSION_SECRET: SECRET, LESSONS: fakeR2({ object: r2Object }) },
      params: { lessonId: "5" },
    });
    expect(res.status).toBe(206);
    expect(res.headers.get("Content-Range")).toBe("bytes 9999500-9999999/10000000");
    expect(res.headers.get("Content-Length")).toBe("500");
  });

  it("returns 416 for bytes=-0 (suffix of zero not satisfiable)", async () => {
    const t = await token();
    const db = fakeDB([["enrolments_users", [LESSON]]]);
    const res = await videoGet({
      request: req("https://x/api/portal/lessons/5/video", t, { Range: "bytes=-0" }),
      env: { DB: db, SESSION_SECRET: SECRET, LESSONS: fakeR2({ object: r2Object }) },
      params: { lessonId: "5" },
    });
    expect(res.status).toBe(416);
  });

  it("returns 416 for open-ended range starting at or beyond file size", async () => {
    const t = await token();
    const db = fakeDB([["enrolments_users", [LESSON]]]);
    const res = await videoGet({
      request: req("https://x/api/portal/lessons/5/video", t, { Range: "bytes=10000000-" }),
      env: { DB: db, SESSION_SECRET: SECRET, LESSONS: fakeR2({ object: r2Object }) },
      params: { lessonId: "5" },
    });
    expect(res.status).toBe(416);
    expect(res.headers.get("Content-Range")).toBe("bytes */10000000");
  });

  it("returns 200 for multi-range header (server ignores, serves full content)", async () => {
    const t = await token();
    const db = fakeDB([["enrolments_users", [LESSON]]]);
    const res = await videoGet({
      request: req("https://x/api/portal/lessons/5/video", t, { Range: "bytes=0-100,200-300" }),
      env: { DB: db, SESSION_SECRET: SECRET, LESSONS: fakeR2({ object: r2Object }) },
      params: { lessonId: "5" },
    });
    expect(res.status).toBe(200);
  });

  it("returns 206 for single-byte range bytes=0-0", async () => {
    const t = await token();
    const db = fakeDB([["enrolments_users", [LESSON]]]);
    const res = await videoGet({
      request: req("https://x/api/portal/lessons/5/video", t, { Range: "bytes=0-0" }),
      env: { DB: db, SESSION_SECRET: SECRET, LESSONS: fakeR2({ object: r2Object }) },
      params: { lessonId: "5" },
    });
    expect(res.status).toBe(206);
    expect(res.headers.get("Content-Range")).toBe("bytes 0-0/10000000");
    expect(res.headers.get("Content-Length")).toBe("1");
  });
});

// ---------------------------------------------------------------------------
// OPTIONS preflight
// ---------------------------------------------------------------------------
describe("OPTIONS /api/portal/lessons/:id/video", () => {
  it("returns 204 for allowed native origin", async () => {
    const res = await videoOptions({
      request: new Request("https://x/api/portal/lessons/5/video", {
        method: "OPTIONS",
        headers: { origin: "https://localhost" },
      }),
    });
    expect(res.status).toBe(204);
  });

  it("returns 403 for disallowed origin", async () => {
    const res = await videoOptions({
      request: new Request("https://x/api/portal/lessons/5/video", {
        method: "OPTIONS",
        headers: { origin: "https://evil.com" },
      }),
    });
    expect(res.status).toBe(403);
  });
});
