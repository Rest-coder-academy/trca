// Course + lesson reads for the student portal (#136), and instructor
// CRUD helpers for Phase 2 (#186).
//
// These take the D1 binding rather than reaching for it, so the API routes stay
// thin and the query shapes are unit-testable against a fake database.

// The courses a student is actually enrolled in. Unpublished courses are
// withheld even from an enrolled student: `published` is the academy's switch
// for "this is ready to be seen", and an enrolment does not override it.
export async function listEnrolledCourses(db, userId) {
  const { results } = await db
    .prepare(
      "SELECT c.id, c.slug, c.title, c.summary, c.cover_url, " +
        "(SELECT COUNT(*) FROM lessons l WHERE l.course_id = c.id AND l.published = 1) AS lesson_count " +
        "FROM enrolments_users eu " +
        "JOIN courses c ON c.id = eu.course_id " +
        "WHERE eu.user_id = ?1 AND c.published = 1 " +
        "ORDER BY c.title ASC"
    )
    .bind(userId)
    .all();
  return results || [];
}

// One course with its lessons, but only if this student is enrolled in it.
//
// Returns null both for "no such course" and for "not enrolled", deliberately.
// The caller turns that into a 404 either way, so an outsider probing slugs
// cannot tell a real course they lack access to from one that does not exist.
export async function getEnrolledCourse(db, userId, slug) {
  const course = await db
    .prepare(
      "SELECT c.id, c.slug, c.title, c.summary, c.cover_url " +
        "FROM enrolments_users eu " +
        "JOIN courses c ON c.id = eu.course_id " +
        "WHERE eu.user_id = ?1 AND c.slug = ?2 AND c.published = 1"
    )
    .bind(userId, slug)
    .first();
  if (!course) return null;

  const { results } = await db
    .prepare(
      "SELECT id, position, title, notes, video_url, duration_seconds " +
        "FROM lessons WHERE course_id = ?1 AND published = 1 " +
        "ORDER BY position ASC"
    )
    .bind(course.id)
    .all();

  return { ...course, lessons: results || [] };
}

// ---------------------------------------------------------------------------
// Instructor: course reads
// ---------------------------------------------------------------------------

export async function getCourseById(db, courseId) {
  return db
    .prepare("SELECT id, slug, title, summary, cover_url, published FROM courses WHERE id = ?1")
    .bind(courseId)
    .first();
}

// ---------------------------------------------------------------------------
// Instructor: lesson reads (includes unpublished)
// ---------------------------------------------------------------------------

export async function listLessonsForInstructor(db, courseId) {
  const { results } = await db
    .prepare(
      "SELECT id, course_id, position, title, notes, video_url, duration_seconds, published " +
        "FROM lessons WHERE course_id = ?1 ORDER BY position ASC"
    )
    .bind(courseId)
    .all();
  return results || [];
}

export async function getLessonById(db, lessonId) {
  return db
    .prepare(
      "SELECT id, course_id, position, title, notes, video_url, duration_seconds, published " +
        "FROM lessons WHERE id = ?1"
    )
    .bind(lessonId)
    .first();
}

// ---------------------------------------------------------------------------
// Instructor: lesson writes
// ---------------------------------------------------------------------------

// Creates a lesson appended at the end of the course (max position + 1).
// Returns the new lesson's id.
export async function createLesson(db, courseId, { title, notes = null }) {
  const maxRow = await db
    .prepare("SELECT COALESCE(MAX(position), 0) AS m FROM lessons WHERE course_id = ?1")
    .bind(courseId)
    .first();
  const position = (maxRow?.m ?? 0) + 1;
  const result = await db
    .prepare(
      "INSERT INTO lessons (course_id, position, title, notes) VALUES (?1, ?2, ?3, ?4)"
    )
    .bind(courseId, position, title.trim(), notes || null)
    .run();
  return result.meta.last_row_id;
}

// Updates only the fields present in `fields`; silently ignores unknown keys.
// Column names are whitelisted to prevent SQL injection even if the caller is
// ever refactored to pass user-supplied keys.
const LESSON_UPDATABLE = { title: true, notes: true, published: true };

export async function updateLesson(db, lessonId, fields) {
  const updates = [];
  const binds = [];
  if (fields.title !== undefined && LESSON_UPDATABLE.title) {
    updates.push(`title = ?${binds.length + 1}`);
    binds.push(fields.title);
  }
  if (fields.notes !== undefined && LESSON_UPDATABLE.notes) {
    updates.push(`notes = ?${binds.length + 1}`);
    binds.push(fields.notes ?? null);
  }
  if (fields.published !== undefined && LESSON_UPDATABLE.published) {
    updates.push(`published = ?${binds.length + 1}`);
    binds.push(fields.published ? 1 : 0);
  }
  if (!updates.length) return;
  binds.push(lessonId);
  await db
    .prepare(`UPDATE lessons SET ${updates.join(", ")} WHERE id = ?${binds.length}`)
    .bind(...binds)
    .run();
}

export async function deleteLesson(db, lessonId) {
  await db.prepare("DELETE FROM lessons WHERE id = ?1").bind(lessonId).run();
}

// Full position replacement: `orderedIds` is the desired lesson order (1-based
// positions are assigned by array index). All IDs must belong to `courseId`.
export async function reorderLessons(db, courseId, orderedIds) {
  const stmts = orderedIds.map((id, index) =>
    db
      .prepare("UPDATE lessons SET position = ?1 WHERE id = ?2 AND course_id = ?3")
      .bind(index + 1, id, courseId)
  );
  await db.batch(stmts);
}

// Verifies that a student is enrolled in the course that owns lesson `lessonId`,
// and that both the course and the lesson are published.
//
// Returns { id, title, video_url } when access is allowed, or null otherwise.
// Returns null for every failure mode (not enrolled, not published, unknown ID)
// so the caller can return a uniform 404 with no information leakage about
// whether the resource exists or is merely inaccessible.
export async function getLessonForStream(db, userId, lessonId) {
  return db
    .prepare(
      "SELECT l.id, l.title, l.video_url " +
        "FROM lessons l " +
        "JOIN courses c ON c.id = l.course_id " +
        "JOIN enrolments_users eu ON eu.course_id = c.id " +
        "WHERE eu.user_id = ?1 AND l.id = ?2 AND c.published = 1 AND l.published = 1"
    )
    .bind(userId, lessonId)
    .first();
}

// Called after a multipart upload completes. Stores the R2 key as video_url.
export async function setLessonVideo(db, lessonId, videoUrl, durationSeconds = null) {
  await db
    .prepare("UPDATE lessons SET video_url = ?1, duration_seconds = ?2 WHERE id = ?3")
    .bind(videoUrl, durationSeconds, lessonId)
    .run();
}
