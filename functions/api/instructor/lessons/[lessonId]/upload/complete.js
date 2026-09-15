// POST /api/instructor/lessons/:lessonId/upload/complete
// Completes a multipart R2 upload and writes video_url + duration_seconds to D1.
// Body: { uploadId, parts: [{ partNumber, etag }, ...], durationSeconds? }
// Returns: { lesson } — updated lesson row.
// Instructor/admin only (#186).
import { requireInstructor } from "../../../../../../shared/portalAuth.js";
import { getLessonById, setLessonVideo } from "../../../../../../shared/courses.js";
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
  if (!env.LESSONS) return json({ error: "unavailable", reason: "storage not configured" }, 503, cors);

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

  const { uploadId, parts, durationSeconds } = body;

  if (!uploadId || typeof uploadId !== "string") {
    return json({ error: "bad_request", reason: "uploadId required" }, 400, cors);
  }
  if (!Array.isArray(parts) || parts.length === 0) {
    return json({ error: "bad_request", reason: "parts must be a non-empty array" }, 400, cors);
  }
  for (const p of parts) {
    if (typeof p.partNumber !== "number" || typeof p.etag !== "string") {
      return json(
        { error: "bad_request", reason: "each part must have numeric partNumber and string etag" },
        400,
        cors
      );
    }
  }

  const key = `lessons/${lessonId}.mp4`;
  const upload = env.LESSONS.resumeMultipartUpload(key, uploadId);
  await upload.complete(parts);

  // R2 key stored as video_url; the stream API (#187) resolves it to a response.
  const dur =
    typeof durationSeconds === "number" && durationSeconds > 0
      ? Math.round(durationSeconds)
      : null;
  await setLessonVideo(env.DB, lessonId, key, dur);

  const updated = await getLessonById(env.DB, lessonId);
  return json({ lesson: updated }, 200, cors);
}
