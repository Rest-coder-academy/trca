import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../App";
import { placements } from "../organism/placements/placement";
import "./PlacementsPage.css";

const ORIGIN = "https://restcoderacademy.in";
// Same @id as the EducationalOrganization node in index.html, so these
// reviews are read as reviews of that entity, not a disconnected one.
const ORG_ID = `${ORIGIN}/#org`;

function PlacementsPage() {
  const { openModal } = useAuth();
  const url = `${ORIGIN}/placements`;
  const description =
    "Real students, real companies, real roles. See where Rest Coder Academy graduates work — " +
    "SAP Hybris, HCL Technologies, SKAD IT Solutions and more.";

  // Review schema built from the same named, real placements rendered below —
  // nothing here is invented. No parent quotes: the repo has none on record,
  // and a plausible-looking guess is exactly the kind of claim a visitor
  // holds you to (same principle #9's hero copy followed for placedCount).
  // No reviewRating either, for the same reason: the placements data has no
  // rating field, so a numeric star score would be a fabricated one — and
  // an identical 5/5 on every review reads as exactly that to both readers
  // and Google's structured-data spam checks.
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": placements.map((p) => ({
      "@type": "Review",
      itemReviewed: { "@id": ORG_ID },
      author: { "@type": "Person", name: p.name },
      reviewBody: p.description,
    })),
  };

  return (
    <>
      <title>Student Placements — Real Outcomes | Rest Coder Academy</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main className="pl">
        <header className="pl-hero">
          <span className="pl-eyebrow">Success stories</span>
          <h1>Where our students ended up.</h1>
          <p>
            Not stock photos or vague promises — named students, the companies that hired them,
            and the roles they landed.
          </p>
          <div className="pl-cta">
            <button className="pl-btn" type="button" onClick={openModal}>Talk to a counsellor</button>
            <Link className="pl-btn pl-btn--ghost" to="/">See our courses</Link>
          </div>
        </header>

        <section className="pl-list">
          {placements.map((p) => (
            <article className="pl-card" key={p.name}>
              <img className="pl-photo" src={p.image} alt={p.name} />
              <div className="pl-body">
                <h2>{p.name}</h2>
                <p className="pl-role">{p.designation} · {p.company?.name}</p>
                {p.company?.logo && (
                  <img className="pl-logo" src={p.company.logo} alt={`${p.company.name} logo`} />
                )}
                <p className="pl-quote">&ldquo;{p.description}&rdquo;</p>
              </div>
            </article>
          ))}
        </section>

        <section className="pl-foot">
          <h2>Want an outcome like this?</h2>
          <p>Talk to a counsellor about the course, the fees and EMI, and the next batch.</p>
          <div className="pl-cta">
            <button className="pl-btn" type="button" onClick={openModal}>Talk to a counsellor</button>
            <Link className="pl-btn pl-btn--ghost" to="/for-parents">For parents</Link>
          </div>
        </section>
      </main>
    </>
  );
}

export default PlacementsPage;
