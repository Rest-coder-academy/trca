import React from "react";
import { useAuth } from "../../../App";
import { useBatches } from "../Batches/useBatches";
import { getNextBatchForCourse, formatBatchDateShort } from "../Batches/batchDateUtils";
import "./CourseCard.css";

// Course card — Abhigna's uniform design (design/ui-template.html §5 + the
// payment-gateway flow): fixed skeleton so every card in a row is the same
// height, a reserved price slot ("Fee on request" until priced), a condensed
// syllabus, and "Book your seat" with a counsellor secondary. One style for
// every course — the paid course (FDE) differs only by showing its fee.
function CoursesCard({ name, courseId, paid, price, audience, backend, syllabus1, syllabus2 }) {
  const { openEnroll, openModal } = useAuth();
  const batches = useBatches();
  const nextBatch = getNextBatchForCourse(name, batches);

  // A few bullets, not the old two-column tech grid.
  const bullets = (paid ? [...(syllabus1 || []), ...(syllabus2 || [])] : backend || []).filter(Boolean);

  const book = () => openEnroll({ courseId, name, paid, price });

  return (
    <div className="course-card">
      <div className="hd">
        <h3>{name}</h3>
        <p>{audience || "For Freshers & Working Professionals"}</p>
      </div>

      <span className={"tag" + (nextBatch ? "" : " tag--muted")}>
        {nextBatch ? `Next batch · ${formatBatchDateShort(nextBatch.date)}` : "New dates coming soon"}
      </span>

      {paid ? (
        <p className="price">
          ₹{Number(price).toLocaleString("en-IN")} <small>· EMI available</small>
        </p>
      ) : (
        <p className="price price--request">Fee on request</p>
      )}

      <ul>
        {bullets.map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>

      <div className="foot">
        <button className="book-btn" type="button" onClick={book}>
          Book your seat
        </button>
        <button className="counsellor" type="button" onClick={openModal}>
          Or talk to a counsellor first
        </button>
      </div>
    </div>
  );
}

export default CoursesCard;
