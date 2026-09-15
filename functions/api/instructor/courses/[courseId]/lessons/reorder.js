// POST /api/instructor/courses/:courseId/lessons/reorder
// Body: { order: [lessonId, lessonId, ...] } — full desired order, 0-indexed = position 1.
// Instructor/admin only (#186).
import { requireInstructor } from "../../../../../../shared/portalAuth.js";
import {
  getCourseById,
  listLessonsForInstructor,
  reorderLessons,
} from "../../../../../../shared/courses.js";
import { nativeCorsHeaders, nativeCorsPreflight } from "../../../../../../shared/nativeCors.js";

const json = (body, status = 200, extra = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store", ...extra },
  });

export const onRequestOptions = ({ request }) => nativeCorsPreflight(request);

export async function onRequestPost(context) {
  const { request, env, params } = context;
  const cors = nativeCorsHeaders(request);

  const auth = await requireInstructor(request, env);
  if (auth instanceof Response) return auth;
  if (!env.DB) return json({ error: "unavailable" }, 503, cors);

  const courseId = Number(params.courseId);
  if (!courseId) return json({ error: "not_found" }, 404, cors);

  const course = await getCourseById(env.DB, courseId);
  if (!course) return json({ error: "not_found" }, 404, cors);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "bad_request", reason: "invalid JSON" }, 400, cors);
  }

  const order = body.order;
  if (!Array.isArray(order) || order.length === 0) {
    return json(
      { error: "bad_request", reason: "order must be a non-empty array of lesson IDs" },
      400,
      cors
    );
  }

  const existing = await listLessonsForInstructor(env.DB, courseId);
  const existingIds = new Set(existing.map((l) => l.id));

  if (order.length !== existing.length) {
    return json(
      { error: "bad_request", reason: "order must contain every lesson ID for this course" },
      400,
      cors
    );
  }
  if (new Set(order).size !== order.length) {
    return json({ error: "bad_request", reason: "order contains duplicate IDs" }, 400, cors);
  }
  for (const id of order) {
    if (!existingIds.has(id)) {
      return json(
        { error: "bad_request", reason: `lesson ${id} does not belong to this course` },
        400,
        cors
      );
    }
  }

  await reorderLessons(env.DB, courseId, order);
  return json({ ok: true }, 200, cors);
}
