// Tests for instructor lesson CRUD — shared/courses.js helpers and
// /api/instructor/courses/:courseId/lessons* + /api/instructor/lessons/:id endpoints.
// (#186)
import { describe, it, expect } from "vitest";
import {
  getCourseById,
  listLessonsForInstructor,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
  reorderLessons,
  setLessonVideo,
} from "../shared/courses.js";
import { onRequestGet as lessonsGet, onRequestPost as lessonsPost } from "../functions/api/instructor/courses/[courseId]/lessons.js";
import { onRequestPost as reorderPost } from "../functions/api/instructor/courses/[courseId]/lessons/reorder.js";
import { onRequestPatch as lessonPatch, onRequestDelete as lessonDelete } from "../functions/api/instructor/lessons/[lessonId].js";

// ---------------------------------------------------------------------------
// Fake DB
// ---------------------------------------------------------------------------
function fakeDB(plan = [], log = []) {
  const db = {
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
  return db;
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
// Fake portal session (for requireInstructor)
// ---------------------------------------------------------------------------
const FUTURE = new Date(Date.now() + 3_600_000).toISOString();

function sessionPlan(role = "instructor") {
  return [
    [
      "from portal_sessions",
      [{ user_id: "u-1", role }],
    ],
  ];
}

function makeReq(url, opts = {}) {
  const { cookie = "__session=sess-valid", method = "GET", body } = opts;
  return new Request(url, {
    method,
    headers: { cookie, ...(body ? { "content-type": "application/json" } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}

// ---------------------------------------------------------------------------
// shared/courses.js — instructor DB helpers
// ---------------------------------------------------------------------------

describe("getCourseById", () => {
  it("returns the course row when it exists", async () => {
    const COURSE = { id: 1, slug: "java-full-stack", title: "Java", summary: null, cover_url: null, published: 1 };
    const db = fakeDB([["from courses where id", [COURSE]]]);
    expect(await getCourseById(db, 1)).toEqual(COURSE);
  });

  it("returns null for unknown id", async () => {
    const db = fakeDB([]);
    expect(await getCourseById(db, 999)).toBeNull();
  });
});

describe("listLessonsForInstructor", () => {
  it("returns all lessons including unpublished", async () => {
    const rows = [
      { id: 1, course_id: 1, position: 1, title: "Intro", notes: null, video_url: null, duration_seconds: null, published: 1 },
      { id: 2, course_id: 1, position: 2, title: "Draft", notes: null, video_url: null, duration_seconds: null, published: 0 },
    ];
    const db = fakeDB([["from lessons where course_id", rows]]);
    expect(await listLessonsForInstructor(db, 1)).toEqual(rows);
  });

  it("returns empty array when course has no lessons", async () => {
    const db = fakeDB([["from lessons where course_id", []]]);
    expect(await listLessonsForInstructor(db, 1)).toEqual([]);
  });
});

describe("getLessonById", () => {
  it("returns lesson when found", async () => {
    const row = { id: 3, course_id: 1, position: 1, title: "T", notes: null, video_url: null, duration_seconds: null, published: 0 };
    const db = fakeDB([["from lessons where id", [row]]]);
    expect(await getLessonById(db, 3)).toEqual(row);
  });

  it("returns null when not found", async () => {
    const db = fakeDB([]);
    expect(await getLessonById(db, 9999)).toBeNull();
  });
});

describe("createLesson", () => {
  it("inserts with position = max + 1 and returns the new id", async () => {
    const log = [];
    const db = fakeDB(
      [["coalesce(max(position)", [{ m: 2 }]]],
      log
    );
    const id = await createLesson(db, 1, { title: "New Lesson" });
    expect(id).toBe(99); // last_row_id from fakeDB.run()
    const insertCall = log.find((e) => e.sql.toLowerCase().includes("insert into lessons"));
    expect(insertCall).toBeDefined();
    expect(insertCall.args[1]).toBe(3); // position = 2 + 1
    expect(insertCall.args[2]).toBe("New Lesson");
  });

  it("assigns position 1 when no existing lessons", async () => {
    const log = [];
    const db = fakeDB([["coalesce(max(position)", [{ m: 0 }]]], log);
    await createLesson(db, 1, { title: "First" });
    const insertCall = log.find((e) => e.sql.toLowerCase().includes("insert into lessons"));
    expect(insertCall.args[1]).toBe(1);
  });

  it("trims whitespace from title", async () => {
    const log = [];
    const db = fakeDB([["coalesce(max(position)", [{ m: 0 }]]], log);
    await createLesson(db, 1, { title: "  Padded  " });
    const insertCall = log.find((e) => e.sql.toLowerCase().includes("insert into lessons"));
    expect(insertCall.args[2]).toBe("Padded");
  });
});

describe("updateLesson", () => {
  it("updates only provided fields", async () => {
    const log = [];
    const db = fakeDB([], log);
    await updateLesson(db, 5, { title: "Updated", published: true });
    const upd = log.find((e) => e.sql.toLowerCase().includes("update lessons"));
    expect(upd).toBeDefined();
    expect(upd.sql).toContain("title");
    expect(upd.sql).toContain("published");
    expect(upd.sql).not.toContain("notes");
  });

  it("converts published boolean to 1/0", async () => {
    const log = [];
    const db = fakeDB([], log);
    await updateLesson(db, 5, { published: false });
    const upd = log.find((e) => e.sql.toLowerCase().includes("update lessons"));
    const publishedIdx = upd.args.indexOf(0);
    expect(publishedIdx).toBeGreaterThanOrEqual(0);
  });

  it("is a no-op when no fields provided", async () => {
    const log = [];
    const db = fakeDB([], log);
    await updateLesson(db, 5, {});
    expect(log).toHaveLength(0);
  });
});

describe("deleteLesson", () => {
  it("issues DELETE for the given id", async () => {
    const log = [];
    const db = fakeDB([], log);
    await deleteLesson(db, 7);
    expect(log[0].sql.toLowerCase()).toContain("delete from lessons");
    expect(log[0].args[0]).toBe(7);
  });
});

describe("reorderLessons", () => {
  it("updates positions in the given order", async () => {
    const log = [];
    const db = fakeDB([], log);
    await reorderLessons(db, 1, [3, 1, 2]);
    // batch runs 3 UPDATE statements
    expect(log).toHaveLength(3);
    expect(log[0].args).toEqual([1, 3, 1]); // position=1, id=3, courseId=1
    expect(log[1].args).toEqual([2, 1, 1]); // position=2, id=1, courseId=1
    expect(log[2].args).toEqual([3, 2, 1]); // position=3, id=2, courseId=1
  });
});

describe("setLessonVideo", () => {
  it("writes video_url and duration_seconds", async () => {
    const log = [];
    const db = fakeDB([], log);
    await setLessonVideo(db, 4, "lessons/4.mp4", 300);
    expect(log[0].sql.toLowerCase()).toContain("update lessons");
    expect(log[0].args).toEqual(["lessons/4.mp4", 300, 4]);
  });

  it("writes null duration when omitted", async () => {
    const log = [];
    const db = fakeDB([], log);
    await setLessonVideo(db, 4, "lessons/4.mp4");
    expect(log[0].args[1]).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Endpoint: GET /api/instructor/courses/:courseId/lessons
// ---------------------------------------------------------------------------

describe("GET /api/instructor/courses/:courseId/lessons", () => {
  const COURSE = { id: 1, slug: "java-full-stack", title: "Java" };
  const LESSONS = [
    { id: 1, course_id: 1, position: 1, title: "Intro", notes: null, video_url: null, duration_seconds: null, published: 1 },
    { id: 2, course_id: 1, position: 2, title: "Draft", notes: null, video_url: null, duration_seconds: null, published: 0 },
  ];

  it("returns 401 without session", async () => {
    const db = fakeDB([...sessionPlan(), ["from courses where id", [COURSE]]]);
    const res = await lessonsGet({
      request: makeReq("https://x/api/instructor/courses/1/lessons", { cookie: "" }),
      env: { DB: db },
      params: { courseId: "1" },
    });
    expect(res.status).toBe(401);
  });

  it("returns 403 for student session", async () => {
    const db = fakeDB([...sessionPlan("student"), ["from courses where id", [COURSE]]]);
    const res = await lessonsGet({
      request: makeReq("https://x/api/instructor/courses/1/lessons"),
      env: { DB: db },
      params: { courseId: "1" },
    });
    expect(res.status).toBe(403);
  });

  it("returns 404 for unknown course", async () => {
    const db = fakeDB([...sessionPlan(), ["from courses where id", []]]);
    const res = await lessonsGet({
      request: makeReq("https://x/api/instructor/courses/999/lessons"),
      env: { DB: db },
      params: { courseId: "999" },
    });
    expect(res.status).toBe(404);
  });

  it("returns all lessons including unpublished for instructor", async () => {
    const db = fakeDB([
      ...sessionPlan(),
      ["from courses where id", [COURSE]],
      ["from lessons where course_id", LESSONS],
    ]);
    const res = await lessonsGet({
      request: makeReq("https://x/api/instructor/courses/1/lessons"),
      env: { DB: db },
      params: { courseId: "1" },
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.lessons).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// Endpoint: POST /api/instructor/courses/:courseId/lessons
// ---------------------------------------------------------------------------

describe("POST /api/instructor/courses/:courseId/lessons", () => {
  const COURSE = { id: 1, slug: "java-full-stack", title: "Java" };

  it("returns 400 for missing title", async () => {
    const db = fakeDB([...sessionPlan(), ["from courses where id", [COURSE]]]);
    const res = await lessonsPost({
      request: makeReq("https://x/api/instructor/courses/1/lessons", { method: "POST", body: { notes: "n" } }),
      env: { DB: db },
      params: { courseId: "1" },
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.reason).toMatch(/title/i);
  });

  it("returns 400 for title over 200 chars", async () => {
    const db = fakeDB([...sessionPlan(), ["from courses where id", [COURSE]]]);
    const res = await lessonsPost({
      request: makeReq("https://x/api/instructor/courses/1/lessons", {
        method: "POST",
        body: { title: "x".repeat(201) },
      }),
      env: { DB: db },
      params: { courseId: "1" },
    });
    expect(res.status).toBe(400);
  });

  it("creates lesson and returns 201 with lesson row", async () => {
    const newLesson = { id: 99, course_id: 1, position: 1, title: "New", notes: null, video_url: null, duration_seconds: null, published: 0 };
    const db = fakeDB([
      ...sessionPlan(),
      ["from courses where id", [COURSE]],
      ["coalesce(max(position)", [{ m: 0 }]],
      ["from lessons where id", [newLesson]],
    ]);
    const res = await lessonsPost({
      request: makeReq("https://x/api/instructor/courses/1/lessons", {
        method: "POST",
        body: { title: "New" },
      }),
      env: { DB: db },
      params: { courseId: "1" },
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.lesson.title).toBe("New");
  });
});

// ---------------------------------------------------------------------------
// Endpoint: POST /api/instructor/courses/:courseId/lessons/reorder
// ---------------------------------------------------------------------------

describe("POST /api/instructor/courses/:courseId/lessons/reorder", () => {
  const COURSE = { id: 1, slug: "java-full-stack", title: "Java" };
  const LESSONS = [
    { id: 1, course_id: 1, position: 1 },
    { id: 2, course_id: 1, position: 2 },
  ];

  it("returns 400 when order is missing", async () => {
    const db = fakeDB([...sessionPlan(), ["from courses where id", [COURSE]]]);
    const res = await reorderPost({
      request: makeReq("https://x/api/instructor/courses/1/lessons/reorder", { method: "POST", body: {} }),
      env: { DB: db },
      params: { courseId: "1" },
    });
    expect(res.status).toBe(400);
  });

  it("returns 400 when order length mismatches lesson count", async () => {
    const db = fakeDB([
      ...sessionPlan(),
      ["from courses where id", [COURSE]],
      ["from lessons where course_id", LESSONS],
    ]);
    const res = await reorderPost({
      request: makeReq("https://x/api/instructor/courses/1/lessons/reorder", {
        method: "POST",
        body: { order: [1] }, // should be [1,2]
      }),
      env: { DB: db },
      params: { courseId: "1" },
    });
    expect(res.status).toBe(400);
  });

  it("returns 400 when order contains duplicate IDs", async () => {
    const db = fakeDB([
      ...sessionPlan(),
      ["from courses where id", [COURSE]],
      ["from lessons where course_id", LESSONS],
    ]);
    const res = await reorderPost({
      request: makeReq("https://x/api/instructor/courses/1/lessons/reorder", {
        method: "POST",
        body: { order: [1, 1] },
      }),
      env: { DB: db },
      params: { courseId: "1" },
    });
    expect(res.status).toBe(400);
  });

  it("returns 200 on valid reorder", async () => {
    const db = fakeDB([
      ...sessionPlan(),
      ["from courses where id", [COURSE]],
      ["from lessons where course_id", LESSONS],
    ]);
    const res = await reorderPost({
      request: makeReq("https://x/api/instructor/courses/1/lessons/reorder", {
        method: "POST",
        body: { order: [2, 1] },
      }),
      env: { DB: db },
      params: { courseId: "1" },
    });
    expect(res.status).toBe(200);
    expect((await res.json()).ok).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Endpoint: PATCH /api/instructor/lessons/:lessonId
// ---------------------------------------------------------------------------

describe("PATCH /api/instructor/lessons/:lessonId", () => {
  const LESSON = { id: 5, course_id: 1, position: 1, title: "Old", notes: null, video_url: null, duration_seconds: null, published: 0 };

  it("returns 403 for student", async () => {
    const db = fakeDB([...sessionPlan("student"), ["from lessons where id", [LESSON]]]);
    const res = await lessonPatch({
      request: makeReq("https://x/api/instructor/lessons/5", { method: "PATCH", body: { title: "X" } }),
      env: { DB: db },
      params: { lessonId: "5" },
    });
    expect(res.status).toBe(403);
  });

  it("returns 404 for unknown lesson", async () => {
    const db = fakeDB([...sessionPlan(), ["from lessons where id", []]]);
    const res = await lessonPatch({
      request: makeReq("https://x/api/instructor/lessons/999", { method: "PATCH", body: { title: "X" } }),
      env: { DB: db },
      params: { lessonId: "999" },
    });
    expect(res.status).toBe(404);
  });

  it("returns 400 for empty title", async () => {
    const db = fakeDB([...sessionPlan(), ["from lessons where id", [LESSON]]]);
    const res = await lessonPatch({
      request: makeReq("https://x/api/instructor/lessons/5", { method: "PATCH", body: { title: "" } }),
      env: { DB: db },
      params: { lessonId: "5" },
    });
    expect(res.status).toBe(400);
  });

  it("returns 400 when no fields provided", async () => {
    const db = fakeDB([...sessionPlan(), ["from lessons where id", [LESSON]]]);
    const res = await lessonPatch({
      request: makeReq("https://x/api/instructor/lessons/5", { method: "PATCH", body: {} }),
      env: { DB: db },
      params: { lessonId: "5" },
    });
    expect(res.status).toBe(400);
  });

  it("returns 200 with updated lesson on success", async () => {
    const updated = { ...LESSON, title: "Updated", published: 1 };
    const db = fakeDB([
      ...sessionPlan(),
      ["from lessons where id", (args) => (args[0] === 5 ? [LESSON] : [updated])],
    ]);
    const res = await lessonPatch({
      request: makeReq("https://x/api/instructor/lessons/5", {
        method: "PATCH",
        body: { title: "Updated", published: true },
      }),
      env: { DB: db },
      params: { lessonId: "5" },
    });
    expect(res.status).toBe(200);
  });
});

// ---------------------------------------------------------------------------
// Endpoint: DELETE /api/instructor/lessons/:lessonId
// ---------------------------------------------------------------------------

describe("DELETE /api/instructor/lessons/:lessonId", () => {
  const LESSON = { id: 5, course_id: 1, position: 1, title: "T", notes: null, video_url: null, duration_seconds: null, published: 0 };

  it("returns 404 for unknown lesson", async () => {
    const db = fakeDB([...sessionPlan(), ["from lessons where id", []]]);
    const res = await lessonDelete({
      request: makeReq("https://x/api/instructor/lessons/999", { method: "DELETE" }),
      env: { DB: db },
      params: { lessonId: "999" },
    });
    expect(res.status).toBe(404);
  });

  it("returns 200 and deletes the lesson", async () => {
    const log = [];
    const db = fakeDB([...sessionPlan(), ["from lessons where id", [LESSON]]], log);
    const res = await lessonDelete({
      request: makeReq("https://x/api/instructor/lessons/5", { method: "DELETE" }),
      env: { DB: db },
      params: { lessonId: "5" },
    });
    expect(res.status).toBe(200);
    const deleteCall = log.find((e) => e.sql.toLowerCase().includes("delete from lessons"));
    expect(deleteCall).toBeDefined();
    expect(deleteCall.args[0]).toBe(5);
  });
});
