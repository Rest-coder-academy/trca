// PATCH  /api/instructor/lessons/:lessonId — edit title, notes, or published flag
// DELETE /api/instructor/lessons/:lessonId — remove a lesson
// Instructor/admin only (#186).
import { requireInstructor } from "../../../../shared/portalAuth.js";
import { getLessonById, updateLesson, deleteLesson } from "../../../../shared/courses.js";
import { nativeCorsHeaders, nativeCorsPreflight } from "../../../../shared/nativeCors.js";

const json = (body, status = 200, extra = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store", ...extra },
  });

export const onRequestOptions = ({ request }) =>
  nativeCorsPreflight(request, "PATCH, DELETE, OPTIONS");

export async function onRequestPatch(context) {
  const { request, env, params } = context;
  const cors = nativeCorsHeaders(request);

  const auth = await requireInstructor(request, env);
  if (auth instanceof Response) return auth;
  if (!env.DB) return json({ error: "unavailable" }, 503, cors);

  const lessonId = Number(params.lessonId);
  if (!lessonId) return json({ error: "not_found" }, 404, cors);

  const lesson = await getLessonById(env.DB, lessonId);
  if (!lesson) return json({ error: "not_found" }, 404, cors);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "bad_request", reason: "invalid JSON" }, 400, cors);
  }

  const fields = {};
  if (body.title !== undefined) {
    const t = typeof body.title === "string" ? body.title.trim() : "";
    if (!t) return json({ error: "bad_request", reason: "title cannot be empty" }, 400, cors);
    if (t.length > 200) return json({ error: "bad_request", reason: "title too long" }, 400, cors);
    fields.title = t;
  }
  if (body.notes !== undefined) fields.notes = body.notes;
  if (body.published !== undefined) fields.published = !!body.published;

  if (!Object.keys(fields).length) {
    return json({ error: "bad_request", reason: "no updatable fields provided" }, 400, cors);
  }

  try {
    await updateLesson(env.DB, lessonId, fields);
    const updated = await getLessonById(env.DB, lessonId);
    return json({ lesson: updated }, 200, cors);
  } catch {
    return json({ error: "unavailable" }, 503, cors);
  }
}

export async function onRequestDelete(context) {
  const { request, env, params } = context;
  const cors = nativeCorsHeaders(request);

  const auth = await requireInstructor(request, env);
  if (auth instanceof Response) return auth;
  if (!env.DB) return json({ error: "unavailable" }, 503, cors);

  const lessonId = Number(params.lessonId);
  if (!lessonId) return json({ error: "not_found" }, 404, cors);

  const lesson = await getLessonById(env.DB, lessonId);
  if (!lesson) return json({ error: "not_found" }, 404, cors);

  try {
    await deleteLesson(env.DB, lessonId);
    return json({ ok: true }, 200, cors);
  } catch {
    return json({ error: "unavailable" }, 503, cors);
  }
}
