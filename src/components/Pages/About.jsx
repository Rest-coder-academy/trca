import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../App";
import "./About.css";

const ORIGIN = "https://restcoderacademy.in";
const FOUNDER = "Nikshep Kulli";
// TODO: replace the initials avatar with a real photo — drop the file in
// src/assets and set PHOTO to the import, or a /public path.
const PHOTO = null;

function initials(name) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function About() {
  const { openModal } = useAuth();
  const url = `${ORIGIN}/about`;
  const description =
    `${FOUNDER}, founder of Rest Coder Academy and a former Head of Engineering, on why he built ` +
    `a coding academy around shipping real production software — and full accountability to students and their families.`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: FOUNDER,
    jobTitle: "Founder, Rest Coder Academy",
    description,
    url,
    worksFor: { "@type": "EducationalOrganization", name: "Rest Coder Academy", sameAs: `${ORIGIN}/` },
    sameAs: ["https://www.linkedin.com/in/nikshepkulli"],
  };

  return (
    <>
      <title>{`About the Founder — ${FOUNDER} | Rest Coder Academy`}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main className="ab">
        <header className="ab-hero">
          <div className="ab-hero-text">
            <span className="ab-eyebrow">The founder</span>
            <h1>The academy I wish existed when I was learning to code.</h1>
            <p>
              I'm {FOUNDER} — an engineer, a former Head of Engineering, and the founder of
              Rest Coder Academy. I started it to train people the way I train the engineers on my
              own teams: build real things, ship them to production, and be accountable for the
              outcome.
            </p>
          </div>
          <div className="ab-photo">
            {PHOTO ? (
              <img src={PHOTO} alt={`${FOUNDER}, founder of Rest Coder Academy`} />
            ) : (
              <span className="ab-avatar" aria-hidden="true">{initials(FOUNDER)}</span>
            )}
            <span className="ab-photo-name">{FOUNDER}<small>Founder</small></span>
          </div>
        </header>

        <section className="ab-block">
          <h2>Where I come from</h2>
          <p>
            I've spent my career building and leading engineering — including as Head of Engineering
            for a 21-store omnichannel retail business, and running an engineering practice that ships
            production software for startups. I've hired engineers, and more importantly, I've grown
            junior people into engineers who can own real systems. That's the part I love most.
          </p>
        </section>

        <section className="ab-block">
          <h2>What I kept seeing</h2>
          <p>
            Too many coding institutes sell a certificate. They teach theory, run you through
            exercises, take the fee — and then go quiet. Students finish without ever shipping
            something real, families have no idea whether it's working, and the job at the end never
            quite shows up. I watched capable people lose months and money to that, and it bothered me.
          </p>
        </section>

        <section className="ab-block">
          <h2>So I built it differently</h2>
          <p>
            Rest Coder Academy teaches the way I actually train engineers: live cohorts, real
            projects, shipping to production — not slideware. And it's built on something no other
            institute does — <b>accountability to your family</b>. Guardians see progress, scores and
            attendance every week, so nobody is left guessing whether the investment is paying off.
          </p>
          <Link className="ab-inline-link" to="/for-parents">See how accountability works for parents →</Link>
        </section>

        <div className="ab-values">
          <div className="ab-value">
            <span className="ab-value-label">Mission</span>
            <p>Turn out production-ready engineers — not certificate-holders — with complete transparency to the students and families investing in them.</p>
          </div>
          <div className="ab-value">
            <span className="ab-value-label">Vision</span>
            <p>A place where every learner, and the family behind them, has real visibility and real outcomes — a job at the end, earned on real work.</p>
          </div>
        </div>

        <section className="ab-signoff">
          <p>If that's the kind of learning you want — for yourself or your child — I'd love to have you.</p>
          <span className="ab-sign">— {FOUNDER}, Founder</span>
          <div className="ab-cta">
            <button className="ab-btn" type="button" onClick={openModal}>Talk to a counsellor</button>
            <Link className="ab-btn ab-btn--ghost" to="/">See our courses</Link>
          </div>
        </section>
      </main>
    </>
  );
}

export default About;
