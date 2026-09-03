import React from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../../App";
import { useFounder, hasFounder } from "./useFounder";
import "./About.css";

const ORIGIN = "https://restcoderacademy.in";

function initials(name) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}
function paragraphs(text) {
  // Normalise CRLF (admin textarea / pasted content) before splitting on blank
  // lines, so multi-paragraph fields render as separate <p>s, not one blob.
  return String(text || "").replace(/\r\n/g, "\n").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
}

// The founder / About page is entirely admin-managed (/admin/founder → D1 →
// /api/founder). It hides itself until a founder name is set, so nothing
// placeholder or wrong is ever shown.
function About() {
  const { openModal } = useAuth();
  const { founder, loaded } = useFounder();

  if (!loaded) return null; // brief: waiting on /api/founder
  if (!hasFounder(founder)) return <Navigate to="/" replace />;

  const { name, title, tagline, intro, story, mission, vision, photo_url, linkedin_url } = founder;
  const url = `${ORIGIN}/about`;
  const heading = String(tagline || "").trim() || `${name} — ${title || "Founder"} of Rest Coder Academy`;
  const description = String(intro || "").trim() || `${name}, ${title || "founder"} of Rest Coder Academy.`;
  const body = paragraphs(story);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    jobTitle: title || "Founder, Rest Coder Academy",
    description,
    url,
    worksFor: { "@type": "EducationalOrganization", name: "Rest Coder Academy", sameAs: `${ORIGIN}/` },
    ...(linkedin_url ? { sameAs: [linkedin_url] } : {}),
  };

  return (
    <>
      <title>{`About ${name} — Rest Coder Academy`}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main className="ab">
        <header className="ab-hero">
          <div className="ab-hero-text">
            <span className="ab-eyebrow">The founder</span>
            <h1>{heading}</h1>
            {intro && <p>{intro}</p>}
          </div>
          <div className="ab-photo">
            {photo_url ? (
              <img src={photo_url} alt={`${name}, founder of Rest Coder Academy`} />
            ) : (
              <span className="ab-avatar" aria-hidden="true">{initials(name)}</span>
            )}
            <span className="ab-photo-name">
              {name}
              <small>{title || "Founder"}</small>
            </span>
          </div>
        </header>

        {body.length > 0 && (
          <section className="ab-block">
            {body.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </section>
        )}

        {(mission || vision) && (
          <div className="ab-values">
            {mission && (
              <div className="ab-value">
                <span className="ab-value-label">Mission</span>
                {paragraphs(mission).map((p, i) => <p key={i}>{p}</p>)}
              </div>
            )}
            {vision && (
              <div className="ab-value">
                <span className="ab-value-label">Vision</span>
                {paragraphs(vision).map((p, i) => <p key={i}>{p}</p>)}
              </div>
            )}
          </div>
        )}

        <section className="ab-signoff">
          <span className="ab-sign">— {name}, {title || "Founder"}</span>
          <div className="ab-cta">
            <button className="ab-btn" type="button" onClick={openModal}>Talk to a counsellor</button>
            <Link className="ab-btn ab-btn--ghost" to="/">See our courses</Link>
            {linkedin_url && (
              <a className="ab-btn ab-btn--ghost" href={linkedin_url} target="_blank" rel="noopener noreferrer">LinkedIn</a>
            )}
          </div>
        </section>
      </main>
    </>
  );
}

export default About;
