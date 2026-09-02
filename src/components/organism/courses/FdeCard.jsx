import React from "react";
import { useAuth } from "../../../App";
import { useBatches } from "../Batches/useBatches";
import { getNextBatchForCourse, formatBatchDateShort } from "../Batches/batchDateUtils";
import "./FdeCard.css";

// Credibility line under the trainer name (specific to the FDE flagship).
const TRAINER_TITLE = "ex-Head of Engineering, Organic Mandya";

function initials(name = "") {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function Check({ filled }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" className="fde-check" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill={filled ? "#03084C" : "#EAF0F6"} />
      <path d="M7.5 12.3l3 3 6-6.3" stroke={filled ? "#FFFFFF" : "#03084C"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Premium flagship course card (the paid FDE course). Distinct from the plain
// CoursesCard template so it visibly outranks the free courses.
function FdeCard({ courseId, name, price, trainer, syllabus1 = [], syllabus2 = [] }) {
  const { openEnroll } = useAuth();
  const batches = useBatches();
  const nextBatch = getNextBatchForCourse(name, batches);
  const modules = [...syllabus1, ...syllabus2].filter(Boolean);
  const enroll = () => openEnroll({ courseId, name, paid: true, price });

  return (
    <div className="fde-card">
      {/* Navy header band */}
      <div className="fde-head">
        <span className="fde-flagship">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 2.5l2.85 6.05 6.65.7-4.95 4.5 1.35 6.55L12 17.6 6.1 20.8l1.35-6.55L2.5 9.25l6.65-.7L12 2.5z" fill="#FFB74D" />
          </svg>
          Flagship
        </span>
        <h3 className="fde-title">{name}</h3>
        <p className="fde-sub">The program that turns juniors into engineers who ship to production.</p>
        <div className="fde-trainer">
          <span className="fde-avatar">{initials(trainer)}</span>
          <span className="fde-trainer-text">
            <b>Taught by {trainer}</b>
            <span>{TRAINER_TITLE}</span>
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="fde-body">
        <div className="fde-price-row">
          <span className="fde-price">
            ₹{Number(price).toLocaleString("en-IN")} <em>one-time</em>
          </span>
          <span className="fde-emi">EMI available</span>
        </div>

        <div className="fde-chips">
          <span>Project-based</span>
          <span>Live cohort</span>
          <span>Ship to production</span>
        </div>

        <div className="fde-syllabus">
          <div className="fde-syllabus-label">What you'll master</div>
          <ul>
            {modules.map((m, i) => (
              <li key={i} className={i === modules.length - 1 ? "fde-capstone" : ""}>
                <Check filled={i === modules.length - 1} />
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </div>

        {nextBatch && (
          <div className="fde-nextbatch">Next batch · {formatBatchDateShort(nextBatch.date)}</div>
        )}

        <button className="fde-enroll" type="button" onClick={enroll}>
          Enroll Now
        </button>
        <div className="fde-secure">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 10V8a6 6 0 1112 0v2m-9 0h6a3 3 0 013 3v4a3 3 0 01-3 3H9a3 3 0 01-3-3v-4a3 3 0 013-3z" stroke="#45545D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Secure Razorpay checkout · pay in full or EMI</span>
        </div>
      </div>
    </div>
  );
}

export default FdeCard;
