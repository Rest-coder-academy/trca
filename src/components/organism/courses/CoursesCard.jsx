import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../App";
import { useBatches } from "../Batches/useBatches";
import { getNextBatchForCourse, formatBatchDateShort } from "../Batches/batchDateUtils";
import "./CourseCard.css";

// FDE-only credibility line under the trainer name.
const FDE_TRAINER_TITLE = "ex-Head of Engineering, Organic Mandya";

function initials(name = "") {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function Check({ filled }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" className="cc-check" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill={filled ? "#03084C" : "#EAF0F6"} />
      <path d="M7.5 12.3l3 3 6-6.3" stroke={filled ? "#FFFFFF" : "#03084C"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// One premium card for every course. The paid flagship (FDE) adds a Flagship
// pill, the trainer credibility line and highlight chips; every card shares the
// navy header, check-icon syllabus, price slot ("Fee on request" until priced),
// equal heights, and "Book your seat" + a counsellor secondary (Abhigna's flow).
function CoursesCard({ name, courseId, slug, paid, flagship, price, trainer, audience, backend, frontend, syllabus1, syllabus2 }) {
  const { openEnroll, openModal } = useAuth();
  const batches = useBatches();
  const nextBatch = getNextBatchForCourse(name, batches);
  const modules = (
    flagship ? [...(syllabus1 || []), ...(syllabus2 || [])] : [...(backend || []), ...(frontend || [])]
  ).filter(Boolean);
  const chips = flagship ? ["Project-based", "Live cohort", "Ship to production"] : [];

  const book = () => openEnroll({ courseId, name, paid, price });

  return (
    <div className={"course-card" + (flagship ? " course-card--flagship" : "")}>
      <div className="cc-head">
        {flagship && (
          <span className="cc-flagship">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 2.5l2.85 6.05 6.65.7-4.95 4.5 1.35 6.55L12 17.6 6.1 20.8l1.35-6.55L2.5 9.25l6.65-.7L12 2.5z" fill="#FFB74D" />
            </svg>
            Flagship
          </span>
        )}
        <h3 className="cc-title">{name}</h3>
        <p className="cc-sub">{audience || "For Freshers & Working Professionals"}</p>
        {flagship && trainer && (
          <div className="cc-trainer">
            <span className="cc-avatar">{initials(trainer)}</span>
            <span className="cc-trainer-text">
              <b>Taught by {trainer}</b>
              <span>{FDE_TRAINER_TITLE}</span>
            </span>
          </div>
        )}
      </div>

      <div className="cc-body">
        <div className="cc-price-row">
          {paid ? (
            <span className="cc-price">
              ₹{Number(price).toLocaleString("en-IN")} <small>· EMI available</small>
            </span>
          ) : (
            <span className="cc-price cc-price--request">Fee on request</span>
          )}
        </div>

        <div className={"cc-schedule" + (nextBatch ? "" : " cc-schedule--soon")}>
          {nextBatch ? (
            <>
              <span className="cc-sched-label">Next batch</span>
              <span className="cc-sched-main">
                {[nextBatch.day, formatBatchDateShort(nextBatch.date), nextBatch.time].filter(Boolean).join(" · ")}
              </span>
              <span className="cc-sched-meta">
                {[nextBatch.mode, nextBatch.duration, nextBatch.trainer && `Trainer: ${nextBatch.trainer}`].filter(Boolean).join(" · ")}
              </span>
            </>
          ) : (
            "New dates coming soon"
          )}
        </div>

        {chips.length > 0 && (
          <div className="cc-chips">
            {chips.map((c, i) => (
              <span key={i}>{c}</span>
            ))}
          </div>
        )}

        <div className="cc-syllabus">
          <div className="cc-syllabus-label">What you'll {flagship ? "master" : "learn"}</div>
          <ul>
            {modules.map((m, i) => (
              <li key={i} className={flagship && i === modules.length - 1 ? "cc-capstone" : ""}>
                <Check filled={flagship && i === modules.length - 1} />
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="cc-foot">
          <button className="cc-book" type="button" onClick={book}>
            Book your seat
          </button>
          <button className="cc-counsellor" type="button" onClick={openModal}>
            Or talk to a counsellor first
          </button>
          <Link className="cc-details" to={`/courses/${slug || courseId}`}>
            Full syllabus &amp; details →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default CoursesCard;
