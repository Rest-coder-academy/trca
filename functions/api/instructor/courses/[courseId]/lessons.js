// GET  /api/instructor/courses/:courseId/lessons  — list all lessons (incl. unpublished)
// POST /api/instructor/courses/:courseId/lessons  — create a lesson
// Instructor/admin only (#186).
import { requireInstructor } from "../../../../../shared/portalAuth.js";
import {
  getCourseById,
  listLessonsForInstructor,
  createLesson,
  getLessonById,
} from "../../../../../shared/courses.js";
import { nativeCorsHeaders, nativeCorsPreflight } from "../../../../../shared/nativeCors.js";

const json = (body, status = 200, extra = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store", ...extra },
  });

export const onRequestOptions = ({ request }) => nativeCorsPreflight(request);

export async function onRequestGet(context) {
  const { request, env, params } = context;
  const cors = nativeCorsHeaders(request);

  const auth = await requireInstructor(request, env);
  if (auth instanceof Response) return auth;
  if (!env.DB) return json({ error: "unavailable" }, 503, cors);

  const courseId = Number(params.courseId);
  if (!courseId) return json({ error: "not_found" }, 404, cors);

  try {
    const course = await getCourseById(env.DB, courseId);
    if (!course) return json({ error: "not_found" }, 404, cors);
    const lessons = await listLessonsForInstructor(env.DB, courseId);
    return json({ lessons }, 200, cors);
  } catch {
    return json({ error: "unavailable" }, 503, cors);
  }
}

export async function onRequestPost(context) {
  const { request, env, params } = context;
  const cors = nativeCorsHeaders(request);

  const auth = await requireInstructor(request, env);
  if (auth instanceof Response) return auth;
  if (!env.DB) return json({ error: "unavailable" }, 503, cors);

  const courseId = Number(params.courseId);
  if (!courseId) return json({ error: "not_found" }, 404, cors);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "bad_request", reason: "invalid JSON" }, 400, cors);
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) return json({ error: "bad_request", reason: "title required" }, 400, cors);
  if (title.length > 200) return json({ error: "bad_request", reason: "title too long" }, 400, cors);

  const notes = typeof body.notes === "string" ? body.notes : null;

  try {
    const course = await getCourseById(env.DB, courseId);
    if (!course) return json({ error: "not_found" }, 404, cors);
    const lessonId = await createLesson(env.DB, courseId, { title, notes });
    const lesson = await getLessonById(env.DB, lessonId);
    return json({ lesson }, 201, cors);
  } catch {
    return json({ error: "unavailable" }, 503, cors);
  }
}
