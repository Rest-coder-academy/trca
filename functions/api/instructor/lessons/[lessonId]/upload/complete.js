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

  let lesson;
  try {
    lesson = await getLessonById(env.DB, lessonId);
  } catch {
    return json({ error: "unavailable" }, 503, cors);
  }
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

  // Complete the R2 upload first. If this fails, the DB is not touched and the
  // client can retry. If R2 succeeds but the DB write below fails, the video
  // exists in R2 but is unreachable until the client calls complete again — R2
  // allows completing the same multipart upload multiple times safely.
  try {
    const upload = env.LESSONS.resumeMultipartUpload(key, uploadId);
    await upload.complete(parts);
  } catch {
    return json({ error: "unavailable", reason: "storage error — retry" }, 503, cors);
  }

  // R2 key stored as video_url; the stream API (#187) resolves it to a response.
  const dur =
    typeof durationSeconds === "number" && durationSeconds > 0
      ? Math.round(durationSeconds)
      : null;

  try {
    await setLessonVideo(env.DB, lessonId, key, dur);
    const updated = await getLessonById(env.DB, lessonId);
    return json({ lesson: updated }, 200, cors);
  } catch {
    // R2 upload is committed. DB write failed — video is in R2 but lesson row
    // not yet updated. Client should retry complete() with the same uploadId.
    return json({ error: "unavailable", reason: "storage committed, db write failed — retry" }, 503, cors);
  }
}
