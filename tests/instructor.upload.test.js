// Tests for R2 multipart upload endpoints (#186):
//   POST /api/instructor/lessons/:lessonId/upload/init
//   PUT  /api/instructor/lessons/:lessonId/upload/part
//   POST /api/instructor/lessons/:lessonId/upload/complete
import { describe, it, expect } from "vitest";
import { onRequestPost as initPost } from "../functions/api/instructor/lessons/[lessonId]/upload/init.js";
import { onRequestPut as partPut } from "../functions/api/instructor/lessons/[lessonId]/upload/part.js";
import { onRequestPost as completePost } from "../functions/api/instructor/lessons/[lessonId]/upload/complete.js";

// ---------------------------------------------------------------------------
// Fake DB (same pattern as instructor.lessons.test.js)
// ---------------------------------------------------------------------------
function fakeDB(plan = [], log = []) {
  return {
    prepare(sql) {
      const stmt = {
        _args: [],
        bind(...args) { stmt._args = args; return stmt; },
        async first() {
          log.push({ sql, args: stmt._args });
          return (resolve(plan, sql, stmt._args) || [])[0] ?? null;
        },
        async all() {
          log.push({ sql, args: stmt._args });
          return { results: resolve(plan, sql, stmt._args) ?? [] };
        },
        async run() {
          log.push({ sql, args: stmt._args });
          return { meta: { last_row_id: 99, changes: 1 } };
        },
      };
      return stmt;
    },
    async batch(stmts) {
      for (const s of stmts) await s.run();
      return [];
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

// ---------------------------------------------------------------------------
// Fake R2 bucket
// ---------------------------------------------------------------------------
function fakeR2({ uploadId = "uid-123", etag = "etag-abc" } = {}) {
  const parts = [];
  const r2 = {
    completed: null,
    createMultipartUpload(key) {
      return Promise.resolve({ uploadId, key });
    },
    resumeMultipartUpload(key, uid) {
      return {
        uploadPart(partNumber, body) {
          parts.push({ partNumber, body });
          return Promise.resolve({ partNumber, etag });
        },
        complete(completedParts) {
          r2.completed = completedParts;
          return Promise.resolve({});
        },
      };
    },
    get parts() { return parts; },
  };
  return r2;
}

// ---------------------------------------------------------------------------
// Fake portal session plan
// ---------------------------------------------------------------------------
function sessionPlan(role = "instructor") {
  return [["from portal_sessions", [{ user_id: "u-1", role }]]];
}

function makeReq(url, opts = {}) {
  const { cookie = "__session=sess-valid", method = "POST", body, queryString = "" } = opts;
  return new Request(url + queryString, {
    method,
    headers: { cookie, ...(body ? { "content-type": "application/json" } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}

const LESSON = {
  id: 4,
  course_id: 1,
  position: 1,
  title: "Intro",
  notes: null,
  video_url: null,
  duration_seconds: null,
  published: 0,
};

// ---------------------------------------------------------------------------
// POST /upload/init
// ---------------------------------------------------------------------------

describe("POST /api/instructor/lessons/:id/upload/init", () => {
  it("returns 401 without session", async () => {
    const db = fakeDB([...sessionPlan(), ["from lessons where id", [LESSON]]]);
    const r2 = fakeR2();
    const res = await initPost({
      request: makeReq("https://x/api/instructor/lessons/4/upload/init", { cookie: "" }),
      env: { DB: db, LESSONS: r2 },
      params: { lessonId: "4" },
    });
    expect(res.status).toBe(401);
  });

  it("returns 503 when LESSONS binding missing", async () => {
    const db = fakeDB([...sessionPlan(), ["from lessons where id", [LESSON]]]);
    const res = await initPost({
      request: makeReq("https://x/api/instructor/lessons/4/upload/init"),
      env: { DB: db },
      params: { lessonId: "4" },
    });
    expect(res.status).toBe(503);
  });

  it("returns 404 for unknown lesson", async () => {
    const db = fakeDB([...sessionPlan(), ["from lessons where id", []]]);
    const r2 = fakeR2();
    const res = await initPost({
      request: makeReq("https://x/api/instructor/lessons/999/upload/init"),
      env: { DB: db, LESSONS: r2 },
      params: { lessonId: "999" },
    });
    expect(res.status).toBe(404);
  });

  it("returns uploadId and key on success", async () => {
    const db = fakeDB([...sessionPlan(), ["from lessons where id", [LESSON]]]);
    const r2 = fakeR2({ uploadId: "uid-xyz" });
    const res = await initPost({
      request: makeReq("https://x/api/instructor/lessons/4/upload/init"),
      env: { DB: db, LESSONS: r2 },
      params: { lessonId: "4" },
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.uploadId).toBe("uid-xyz");
    expect(body.key).toBe("lessons/4.mp4");
  });
});

// ---------------------------------------------------------------------------
// PUT /upload/part
// ---------------------------------------------------------------------------

describe("PUT /api/instructor/lessons/:id/upload/part", () => {
  it("returns 400 when uploadId missing", async () => {
    const db = fakeDB([...sessionPlan(), ["from lessons where id", [LESSON]]]);
    const r2 = fakeR2();
    const res = await partPut({
      request: makeReq("https://x/api/instructor/lessons/4/upload/part?part=1", { method: "PUT" }),
      env: { DB: db, LESSONS: r2 },
      params: { lessonId: "4" },
    });
    expect(res.status).toBe(400);
    expect((await res.json()).reason).toMatch(/uploadId/i);
  });

  it("returns 400 for part number out of range", async () => {
    const db = fakeDB([...sessionPlan(), ["from lessons where id", [LESSON]]]);
    const r2 = fakeR2();
    const res = await partPut({
      request: makeReq("https://x/api/instructor/lessons/4/upload/part?uploadId=uid&part=0", {
        method: "PUT",
      }),
      env: { DB: db, LESSONS: r2 },
      params: { lessonId: "4" },
    });
    expect(res.status).toBe(400);
  });

  it("returns etag and partNumber on success", async () => {
    const db = fakeDB([...sessionPlan(), ["from lessons where id", [LESSON]]]);
    const r2 = fakeR2({ etag: "etag-001" });
    const res = await partPut({
      request: makeReq(
        "https://x/api/instructor/lessons/4/upload/part?uploadId=uid-123&part=1",
        { method: "PUT" }
      ),
      env: { DB: db, LESSONS: r2 },
      params: { lessonId: "4" },
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.etag).toBe("etag-001");
    expect(body.partNumber).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// POST /upload/complete
// ---------------------------------------------------------------------------

describe("POST /api/instructor/lessons/:id/upload/complete", () => {
  const PARTS = [{ partNumber: 1, etag: "etag-001" }];

  it("returns 400 when uploadId missing", async () => {
    const db = fakeDB([...sessionPlan(), ["from lessons where id", [LESSON]]]);
    const r2 = fakeR2();
    const res = await completePost({
      request: makeReq("https://x/api/instructor/lessons/4/upload/complete", {
        body: { parts: PARTS },
      }),
      env: { DB: db, LESSONS: r2 },
      params: { lessonId: "4" },
    });
    expect(res.status).toBe(400);
    expect((await res.json()).reason).toMatch(/uploadId/i);
  });

  it("returns 400 when parts array is empty", async () => {
    const db = fakeDB([...sessionPlan(), ["from lessons where id", [LESSON]]]);
    const r2 = fakeR2();
    const res = await completePost({
      request: makeReq("https://x/api/instructor/lessons/4/upload/complete", {
        body: { uploadId: "uid-123", parts: [] },
      }),
      env: { DB: db, LESSONS: r2 },
      params: { lessonId: "4" },
    });
    expect(res.status).toBe(400);
  });

  it("returns 400 when a part has wrong shape", async () => {
    const db = fakeDB([...sessionPlan(), ["from lessons where id", [LESSON]]]);
    const r2 = fakeR2();
    const res = await completePost({
      request: makeReq("https://x/api/instructor/lessons/4/upload/complete", {
        body: { uploadId: "uid-123", parts: [{ partNumber: "one", etag: "e" }] },
      }),
      env: { DB: db, LESSONS: r2 },
      params: { lessonId: "4" },
    });
    expect(res.status).toBe(400);
  });

  it("completes upload and updates DB, returns lesson with video_url", async () => {
    const updatedLesson = { ...LESSON, video_url: "lessons/4.mp4", duration_seconds: 300 };
    const db = fakeDB([
      ...sessionPlan(),
      ["from lessons where id", (args) => (args[0] === 4 ? [LESSON] : [updatedLesson])],
    ]);
    const r2 = fakeR2();
    const res = await completePost({
      request: makeReq("https://x/api/instructor/lessons/4/upload/complete", {
        body: { uploadId: "uid-123", parts: PARTS, durationSeconds: 300 },
      }),
      env: { DB: db, LESSONS: r2 },
      params: { lessonId: "4" },
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.lesson).toBeDefined();
  });

  it("stores null duration when durationSeconds is absent", async () => {
    const log = [];
    const updatedLesson = { ...LESSON, video_url: "lessons/4.mp4" };
    const db = fakeDB(
      [
        ...sessionPlan(),
        ["from lessons where id", [LESSON, updatedLesson]],
      ],
      log
    );
    const r2 = fakeR2();
    await completePost({
      request: makeReq("https://x/api/instructor/lessons/4/upload/complete", {
        body: { uploadId: "uid-123", parts: PARTS },
      }),
      env: { DB: db, LESSONS: r2 },
      params: { lessonId: "4" },
    });
    const setVideoCall = log.find((e) => e.sql.toLowerCase().includes("update lessons set video_url"));
    expect(setVideoCall).toBeDefined();
    expect(setVideoCall.args[1]).toBeNull();
  });
});
