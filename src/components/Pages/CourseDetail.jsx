import React from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { useAuth } from "../../App";
import { courses } from "../organism/courses/courses";
import { useBatches } from "../organism/Batches/useBatches";
import { getNextBatchForCourse, formatBatchDateShort } from "../organism/Batches/batchDateUtils";
import "./CourseDetail.css";

const ORIGIN = "https://restcoderacademy.in";

function CourseDetail() {
  const { slug } = useParams();
  const { openEnroll, openModal } = useAuth();
  const batches = useBatches();

  const course = courses.find((c) => c.slug === slug || c.courseId === slug);
  // Unknown course → home (router already redirects unknown paths, this guards
  // a real /courses/<garbage>).
  if (!course) return <Navigate to="/" replace />;

  const next = getNextBatchForCourse(course.name, batches);
  const modules = (
    course.flagship
      ? [...(course.syllabus1 || []), ...(course.syllabus2 || [])]
      : [...(course.backend || []), ...(course.frontend || [])]
  ).filter(Boolean);

  const url = `${ORIGIN}/courses/${course.slug || course.courseId}`;
  const priceLabel = `₹${Number(course.price).toLocaleString("en-IN")}`;
  const nextLabel = next
    ? [next.day, formatBatchDateShort(next.date), next.time].filter(Boolean).join(" · ")
    : "New dates coming soon";
  const description =
    `Learn ${course.name} at Rest Coder Academy, Bengaluru — live, project-based training ` +
    `with placement support and EMI (${priceLabel}).` +
    (next ? ` Next batch: ${next.day}, ${formatBatchDateShort(next.date)}.` : "");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.name,
    description,
    provider: {
      "@type": "EducationalOrganization",
      name: "Rest Coder Academy",
      sameAs: `${ORIGIN}/`,
    },
    url,
    offers: {
      "@type": "Offer",
      category: "Paid",
      price: String(course.price),
      priceCurrency: "INR",
    },
  };

  return (
    <>
      {/* React 19 hoists these to <head>. */}
      <title>{`${course.name} Course in Bengaluru — Rest Coder Academy`}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main className="cd">
        <nav className="cd-crumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <span>Courses</span>
          <span>/</span>
          <span aria-current="page">{course.name}</span>
        </nav>

        <header className="cd-hero">
          {course.flagship && <span className="cd-flag">★ Flagship program</span>}
          <h1>{course.name}</h1>
          <p className="cd-aud">{course.audience || "For Freshers & Working Professionals"}</p>
          <div className="cd-meta">
            <span className="cd-price">{priceLabel}<small> · EMI available</small></span>
            <span className="cd-batch"><b>Next batch</b> {nextLabel}</span>
            {course.flagship && course.trainer && (
              <span className="cd-trainer"><b>Trainer</b> {course.trainer}</span>
            )}
          </div>
          <div className="cd-cta">
            <button className="cd-book" type="button" onClick={() => openEnroll({ courseId: course.courseId, name: course.name, paid: course.paid, price: course.price })}>
              Book your seat
            </button>
            <button className="cd-talk" type="button" onClick={openModal}>Talk to a counsellor</button>
          </div>
        </header>

        <section className="cd-accountability">
          <h2>Accountability your family can see</h2>
          <p>
            Unlike most institutes, Rest Coder Academy gives guardians a live view of a student's
            progress, scores and attendance — every week. You always know exactly how the learning
            is going, so nobody is left guessing.
          </p>
          <Link className="cd-parents-link" to="/for-parents">See how it works for parents →</Link>
        </section>

        <section className="cd-syllabus">
          <h2>What you'll {course.flagship ? "master" : "learn"}</h2>
          <ul>
            {modules.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </section>

        <section className="cd-foot">
          <h2>Ready to join {course.name}?</h2>
          <p>{priceLabel} · EMI available · placement support · live, project-based cohort in Bengaluru.</p>
          <div className="cd-cta">
            <button className="cd-book" type="button" onClick={() => openEnroll({ courseId: course.courseId, name: course.name, paid: course.paid, price: course.price })}>
              Book your seat
            </button>
            <Link className="cd-back" to="/" state={{ scrollTo: "Courses" }}>← All courses</Link>
          </div>
        </section>
      </main>
    </>
  );
}

export default CourseDetail;
