import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import SocialMeta from "../atoms/SocialMeta/SocialMeta";
import { useAuth } from "../../App";
import { regex } from "../../regex/regex";
import { trackLead } from "../../lib/analytics";

// A name in Bengaluru can carry a dot ("S.V. Rao"), a hyphen ("Sharma-Iyengar"),
// or an apostrophe ("D'Souza"). The site's `regex.nameWithSpaces` rejects all
// three and would refuse a legitimate application on the surname alone, so this
// page uses a more forgiving check: any Unicode letter (covers Latin with
// diacritics and native-script transliterations) plus spaces and .-'
const APPLY_NAME_RE = /^[\p{L}\p{M}][\p{L}\p{M}\s.'\-]{0,79}$/u;
import "./Apply.css";

const ORIGIN = "https://restcoderacademy.in";
const WA_NUMBER = "918073762257";
const PHONE_TEL = "+918073762257";
const PHONE_DISPLAY = "+91 80737 62257";
const SUBMIT_TIMEOUT_MS = 10000;

const roleOptions = [
  "Working professional — technical",
  "Working professional — non-technical (career switch)",
  "College student — final year",
  "College student — 1st to pre-final year",
  "Other",
];

// The three patterns from Nikshep's Bengaluru hiring-trends LinkedIn post — the
// same post that drives readers to /apply. Kept on the page so a fresh visitor
// lands on the same argument the post made, and the CTA reads as the next step.
const HIRING_SIGNALS = [
  {
    n: "01",
    title: "Read someone else's code",
    body:
      "Reading unfamiliar code is now written into JDs, not left implied. Recruiters have stopped trusting side projects as proof.",
  },
  {
    n: "02",
    title: "Java or Python plus one framework",
    body:
      "A Java or Python framework listing still gets more responses than a 'modern AI stack' listing. The market is quieter about this than LinkedIn suggests.",
  },
  {
    n: "03",
    title: "Career-switchers land in ₹8–12 LPA",
    body:
      "The ₹8–12 LPA band has more openings than ₹5–8 LPA. Career-switchers land there more often than expected — because they already know how to work with humans.",
  },
];

function Apply() {
  const { notify } = useAuth();

  const [form, setForm] = useState({
    fullname: "",
    mobile: "",
    email: "",
    experience: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | submitting | done | failed
  const [failReason, setFailReason] = useState("");

  const url = `${ORIGIN}/apply`;
  const title = "Apply — AI-FDE cohort at Rest Coder Academy, Jayanagar";
  const description =
    "Apply for the next AI-FDE cohort at Rest Coder Academy in Jayanagar, Bengaluru. In-person, eight weeks, career-switchers welcome. Uday Sir or a counsellor will follow up.";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url,
    isPartOf: { "@id": `${ORIGIN}/#org` },
    potentialAction: {
      "@type": "ApplyAction",
      target: url,
    },
  };

  const onChange = ({ target: { name, value } }) => {
    setForm((f) => ({ ...f, [name]: value }));
  };

  const validate = () => {
    const e = {};
    if (!form.fullname.trim()) e.fullname = "Full name is required.";
    else if (!APPLY_NAME_RE.test(form.fullname.trim()))
      e.fullname = "Letters, spaces, and . - ' only.";
    if (!form.mobile.trim()) e.mobile = "Mobile number is required.";
    else if (!regex.mobileRegex.test(form.mobile.trim()))
      e.mobile = "Enter a valid mobile number.";
    if (form.email.trim() && !regex.emailRegex.test(form.email.trim()))
      e.email = "Enter a valid email address.";
    if (!form.experience) e.experience = "Tell us where you are today.";
    return e;
  };

  const submit = async (event) => {
    event.preventDefault();
    if (status === "submitting") return;

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus("submitting");
    setFailReason("");
    try {
      const payload = {
        fullname: form.fullname.trim(),
        mobile: form.mobile.trim(),
        email: form.email.trim(),
        experience: form.experience,
        // Prefix so Uday can see this lead came from /apply (AI-FDE intent)
        // in the same enquiries inbox — no schema change needed.
        message:
          `[apply · AI-FDE] ` +
          (form.message.trim() || "Applied via /apply for the next AI-FDE cohort."),
      };
      const res = await axios.post("/api/enquiry", payload, {
        timeout: SUBMIT_TIMEOUT_MS,
      });
      if (res && res.status >= 200 && res.status < 300) {
        try {
          trackLead("apply_page");
        } catch {
          // Analytics is optional; don't block success on it.
        }
        setStatus("done");
        setForm({ fullname: "", mobile: "", email: "", experience: "", message: "" });
        notify && notify("Application received. We'll call you shortly.");
      } else {
        throw new Error("bad status");
      }
    } catch (err) {
      setStatus("failed");
      setFailReason(
        "We couldn't reach the server. Try again in a moment, or send us the same details on WhatsApp — we reply the same day.",
      );
    }
  };

  const waHref =
    `https://wa.me/${WA_NUMBER}?text=` +
    encodeURIComponent(
      "Hi Rest Coder Academy, I'd like to apply for the next AI-FDE cohort. My name is ",
    );

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <SocialMeta title={title} description={description} url={url} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="ap">
        <header className="ap-hero">
          <span className="ap-eyebrow">Applications open</span>
          <h1>Apply to the next AI-FDE cohort.</h1>
          <p className="ap-lede">
            Eight weeks. In-person at Jayanagar. Career-switchers welcome. Uday Sir or a
            counsellor will call you back — usually the same day.
          </p>
          <div className="ap-hero-facts">
            <div className="ap-fact">
              <span className="ap-fact-k">Cohort</span>
              <span className="ap-fact-v">AI-FDE · 8 weeks</span>
            </div>
            <div className="ap-fact">
              <span className="ap-fact-k">Format</span>
              <span className="ap-fact-v">In-person, Jayanagar</span>
            </div>
            <div className="ap-fact">
              <span className="ap-fact-k">Next intake</span>
              <span className="ap-fact-v">Rolling — first come, first seat</span>
            </div>
          </div>
        </header>

        <section className="ap-signals">
          <h2>Three patterns from 100 Bengaluru full-stack listings this week.</h2>
          <div className="ap-signals-grid">
            {HIRING_SIGNALS.map((s) => (
              <article key={s.n} className="ap-signal">
                <span className="ap-signal-n">{s.n}</span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </article>
            ))}
          </div>
          <p className="ap-signals-foot">
            The AI-FDE cohort at Rest Coder Academy leans into all three. Consistency across
            the eight weeks is what makes each student show up in an interview.
          </p>
        </section>

        <section className="ap-form-wrap" id="apply-form">
          <div className="ap-form-card">
            {status !== "done" ? (
              <>
                <h2>Send us your details.</h2>
                <p className="ap-form-lede">
                  Two minutes. We'll call the mobile number you leave here.
                </p>
                <form className="ap-form" onSubmit={submit} noValidate>
                  <label className="ap-field">
                    <span className="ap-label">Full name</span>
                    <input
                      className={"ap-input" + (errors.fullname ? " ap-input--err" : "")}
                      name="fullname"
                      type="text"
                      autoComplete="name"
                      value={form.fullname}
                      onChange={onChange}
                      maxLength={80}
                      required
                    />
                    {errors.fullname && <span className="ap-err">{errors.fullname}</span>}
                  </label>

                  <label className="ap-field">
                    <span className="ap-label">Mobile number</span>
                    <input
                      className={"ap-input" + (errors.mobile ? " ap-input--err" : "")}
                      name="mobile"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      value={form.mobile}
                      onChange={onChange}
                      maxLength={16}
                      placeholder="+91 …"
                      required
                    />
                    {errors.mobile && <span className="ap-err">{errors.mobile}</span>}
                  </label>

                  <label className="ap-field">
                    <span className="ap-label">Email <span className="ap-label-hint">(optional)</span></span>
                    <input
                      className={"ap-input" + (errors.email ? " ap-input--err" : "")}
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={onChange}
                      maxLength={120}
                    />
                    {errors.email && <span className="ap-err">{errors.email}</span>}
                  </label>

                  <label className="ap-field">
                    <span className="ap-label">Where are you today?</span>
                    <select
                      className={"ap-input" + (errors.experience ? " ap-input--err" : "")}
                      name="experience"
                      value={form.experience}
                      onChange={onChange}
                      required
                    >
                      <option value="">Select one</option>
                      {roleOptions.map((label) => (
                        <option key={label} value={label}>
                          {label}
                        </option>
                      ))}
                    </select>
                    {errors.experience && <span className="ap-err">{errors.experience}</span>}
                  </label>

                  <label className="ap-field ap-field--wide">
                    <span className="ap-label">Anything you want us to know? <span className="ap-label-hint">(optional)</span></span>
                    <textarea
                      className="ap-input ap-textarea"
                      name="message"
                      rows={4}
                      value={form.message}
                      onChange={onChange}
                      maxLength={1500}
                      placeholder="Prior stack, target role, whether you're preparing for a specific interview…"
                    />
                  </label>

                  {status === "failed" && (
                    <div className="ap-fail" role="alert">
                      {failReason}
                    </div>
                  )}

                  <div className="ap-actions">
                    <button
                      className="ap-btn ap-btn--primary"
                      type="submit"
                      disabled={status === "submitting"}
                    >
                      {status === "submitting" ? "Sending…" : "Send my application"}
                    </button>
                    <a
                      className="ap-btn ap-btn--ghost"
                      href={waHref}
                      target="_blank"
                      rel="noreferrer"
                    >
                      WhatsApp us instead
                    </a>
                  </div>
                  <p className="ap-fine">
                    By sending you agree we can call or WhatsApp the number above about the
                    cohort. We don't share it with anyone else.
                  </p>
                </form>
              </>
            ) : (
              <div className="ap-thanks">
                <h2>Application received.</h2>
                <p>
                  Uday Sir or a counsellor will call the number you gave us — usually the
                  same day. If it's after hours, expect the call the next morning.
                </p>
                <div className="ap-actions">
                  <Link className="ap-btn ap-btn--primary" to="/courses/forward-deployed-engineering">
                    Read the cohort page
                  </Link>
                  <Link className="ap-btn ap-btn--ghost" to="/placements">
                    See where students landed
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="ap-help">
          <h2>Prefer to talk first?</h2>
          <p>
            Fees, EMI, batch timings, prerequisites — a counsellor can answer it in one call.
          </p>
          <div className="ap-actions">
            <a className="ap-btn ap-btn--primary" href={`tel:${PHONE_TEL}`}>
              Call {PHONE_DISPLAY}
            </a>
            <a className="ap-btn ap-btn--ghost" href={waHref} target="_blank" rel="noreferrer">
              WhatsApp us
            </a>
            <Link className="ap-btn ap-btn--ghost" to="/faq">
              Read the FAQ
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}

export default Apply;
