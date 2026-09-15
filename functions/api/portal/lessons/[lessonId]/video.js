// GET /api/portal/lessons/:lessonId/video
//
// Streams the lesson video from R2 with HTTP range-request support so the
// player can seek and a download can resume after a dropped connection.
//
// Access rule (matches /api/portal/courses/:slug):
//   - valid session required (401 otherwise)
//   - student must be enrolled in the course that owns this lesson, and both
//     the course and the lesson must be published (404 for any other case,
//     deliberately — no distinction between "not enrolled" and "not found")
//
// Part of #187.
import { getSession } from "../../../../../shared/auth.js";
import { getLessonForStream } from "../../../../../shared/courses.js";
import { nativeCorsHeaders, nativeCorsPreflight } from "../../../../../shared/nativeCors.js";

// Parses an HTTP Range header into an R2-compatible range option.
// Returns null for malformed or unsatisfiable headers (caller should 416).
function parseRangeHeader(header) {
  if (!header) return null;

  // Suffix form: bytes=-N  (last N bytes)
  const suffix = header.match(/^bytes=-(\d+)$/);
  if (suffix) return { suffix: parseInt(suffix[1]) };

  // Offset form: bytes=X-  or  bytes=X-Y
  const range = header.match(/^bytes=(\d+)-(\d*)$/);
  if (!range) return null;

  const offset = parseInt(range[1]);
  if (range[2] === "") return { offset }; // open-ended: X to end
  const end = parseInt(range[2]);
  if (end < offset) return null; // invalid: end before start
  return { offset, length: end - offset + 1 };
}

export const onRequestOptions = ({ request }) =>
  nativeCorsPreflight(request, "GET, OPTIONS");

export async function onRequestGet(context) {
  const { request, env, params } = context;
  const cors = nativeCorsHeaders(request);

  const session = await getSession(request, env);
  if (!session) {
    return new Response(JSON.stringify({ error: "unauthenticated" }), {
      status: 401,
      headers: { "content-type": "application/json", ...cors },
    });
  }

  if (!env.DB) {
    return new Response(JSON.stringify({ error: "unavailable" }), {
      status: 503,
      headers: { "content-type": "application/json", ...cors },
    });
  }

  const lessonId = Number(params.lessonId);
  if (!lessonId) {
    return new Response(JSON.stringify({ error: "not_found" }), {
      status: 404,
      headers: { "content-type": "application/json", ...cors },
    });
  }

  let lesson;
  try {
    lesson = await getLessonForStream(env.DB, session.uid, lessonId);
  } catch {
    return new Response(JSON.stringify({ error: "unavailable" }), {
      status: 503,
      headers: { "content-type": "application/json", ...cors },
    });
  }

  // Null covers: lesson not found, course/lesson unpublished, not enrolled.
  // All treated as 404 so an outsider cannot probe enrolment state.
  if (!lesson) {
    return new Response(JSON.stringify({ error: "not_found" }), {
      status: 404,
      headers: { "content-type": "application/json", ...cors },
    });
  }

  // No video uploaded yet — the lesson row exists but the upload hasn't
  // completed. Treat as 404 to keep the surface area consistent.
  if (!lesson.video_url) {
    return new Response(JSON.stringify({ error: "not_found" }), {
      status: 404,
      headers: { "content-type": "application/json", ...cors },
    });
  }

  if (!env.LESSONS) {
    return new Response(JSON.stringify({ error: "unavailable", reason: "storage not configured" }), {
      status: 503,
      headers: { "content-type": "application/json", ...cors },
    });
  }

  const key = lesson.video_url; // stored as R2 key by the upload endpoint
  const rangeHeader = request.headers.get("Range");
  const rangeOption = parseRangeHeader(rangeHeader);

  // Validate range before hitting R2: suffix of 0 or negative offset is nonsense.
  if (rangeHeader && !rangeOption) {
    return new Response(null, {
      status: 416,
      headers: {
        "Content-Range": "bytes */*",
        "Accept-Ranges": "bytes",
        ...cors,
      },
    });
  }

  let object;
  try {
    object = rangeOption
      ? await env.LESSONS.get(key, { range: rangeOption })
      : await env.LESSONS.get(key);
  } catch {
    return new Response(JSON.stringify({ error: "unavailable" }), {
      status: 503,
      headers: { "content-type": "application/json", ...cors },
    });
  }

  if (!object) {
    // Video row exists in DB but the R2 object is gone — treat as 404.
    return new Response(JSON.stringify({ error: "not_found" }), {
      status: 404,
      headers: { "content-type": "application/json", ...cors },
    });
  }

  const totalSize = object.size;

  if (rangeOption) {
    // R2 tells us exactly what range it served via object.range.
    const served = object.range;
    const start = served?.offset ?? 0;
    const length = served?.length ?? totalSize;
    const end = start + length - 1;

    return new Response(object.body, {
      status: 206,
      headers: {
        "Content-Type": "video/mp4",
        "Content-Length": String(length),
        "Content-Range": `bytes ${start}-${end}/${totalSize}`,
        "Accept-Ranges": "bytes",
        "Cache-Control": "private, no-store",
        ...cors,
      },
    });
  }

  return new Response(object.body, {
    status: 200,
    headers: {
      "Content-Type": "video/mp4",
      "Content-Length": String(totalSize),
      "Accept-Ranges": "bytes",
      "Cache-Control": "private, no-store",
      ...cors,
    },
  });
}
