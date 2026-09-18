// POST /api/instructor/lessons/:lessonId/upload/init
// Initiates an R2 multipart upload for a lesson video.
// Returns: { uploadId, key }
// The client uses uploadId to upload parts and then complete the upload.
// Instructor/admin only (#186).
import { requireInstructor } from "../../../../../../shared/portalAuth.js";
import { getLessonById } from "../../../../../../shared/courses.js";
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

  try {
    const lesson = await getLessonById(env.DB, lessonId);
    if (!lesson) return json({ error: "not_found" }, 404, cors);

    // Stable key per lesson — re-uploading replaces the previous video.
    const key = `lessons/${lessonId}.mp4`;
    const multipart = await env.LESSONS.createMultipartUpload(key, {
      httpMetadata: { contentType: "video/mp4" },
    });

    return json({ uploadId: multipart.uploadId, key }, 200, cors);
  } catch {
    return json({ error: "unavailable" }, 503, cors);
  }
}
