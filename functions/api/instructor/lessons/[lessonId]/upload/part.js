// PUT /api/instructor/lessons/:lessonId/upload/part?uploadId=X&part=N
// Uploads one part of a multipart R2 upload. Body is raw video bytes.
// Returns: { etag, partNumber }
// Parts (except the last) must be ≥ 5 MB — enforced by R2, not here.
// Instructor/admin only (#186).
import { requireInstructor } from "../../../../../../shared/portalAuth.js";
import { getLessonById } from "../../../../../../shared/courses.js";
import { nativeCorsHeaders, nativeCorsPreflight } from "../../../../../../shared/nativeCors.js";

const json = (body, status = 200, extra = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store", ...extra },
  });

export const onRequestOptions = ({ request }) =>
  nativeCorsPreflight(request, "PUT, OPTIONS");

export async function onRequestPut(context) {
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

  const url = new URL(request.url);
  const uploadId = url.searchParams.get("uploadId");
  const partNumber = Number(url.searchParams.get("part"));

  if (!uploadId) return json({ error: "bad_request", reason: "uploadId required" }, 400, cors);
  if (!partNumber || partNumber < 1 || partNumber > 10000) {
    return json({ error: "bad_request", reason: "part must be between 1 and 10000" }, 400, cors);
  }

  const key = `lessons/${lessonId}.mp4`;
  const upload = env.LESSONS.resumeMultipartUpload(key, uploadId);
  const uploaded = await upload.uploadPart(partNumber, request.body);

  return json({ etag: uploaded.etag, partNumber: uploaded.partNumber }, 200, cors);
}
