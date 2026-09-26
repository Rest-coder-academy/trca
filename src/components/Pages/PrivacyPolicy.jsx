import React from "react";
import SocialMeta from "../atoms/SocialMeta/SocialMeta";
import {
  ADDRESS,
  EMAIL,
  PHONE_DISPLAY,
  PHONE_TEL,
} from "../../data/contact";
import "./Legal.css";

/**
 * /privacy-policy — RCA's privacy policy.
 *
 * Written by Claude for founder review before Meta app submission (see
 * task #80). Content is a plain-English DPDP-2023-aware policy covering
 * the personal-data flows this site actually has today: enquiry form,
 * Firebase-backed student portal login, Razorpay checkout, WhatsApp
 * lead conversations, Meta Pixel + Google Analytics + Google Ads
 * conversion tracking, embedded YouTube. Every claim maps to a live
 * integration in the codebase — no invented processors.
 *
 * Awaiting Uday Pawar review + explicit merge approval. Once live at
 * https://restcoderacademy.in/privacy-policy this URL feeds Meta's
 * required Privacy Policy field for the RCA Meta app so
 * instagram_content_publish app review can be submitted.
 */

const ORIGIN = "https://restcoderacademy.in";

// Update this line whenever the policy substantively changes. It's what
// Data Principals see when checking whether the terms they agreed to
// still stand.
const EFFECTIVE_DATE = "26 September 2026";

function PrivacyPolicy() {
  const url = `${ORIGIN}/privacy-policy`;
  const title = "Privacy Policy — Rest Coder Academy";
  const description =
    "How Rest Coder Academy collects, uses, and protects personal data of students, guardians and website visitors — under India's Digital Personal Data Protection Act, 2023.";

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <SocialMeta title={title} description={description} url={url} />

      <main className="legal">
        <span className="legal-eyebrow">Legal</span>
        <h1>Privacy Policy</h1>
        <p className="legal-meta">
          Effective {EFFECTIVE_DATE}. This policy explains what personal
          data Rest Coder Academy handles, why, for how long, and how
          you can exercise your rights over it.
        </p>

        <div className="legal-toc" aria-label="On this page">
          <ol>
            <li><a href="#who">Who we are</a></li>
            <li><a href="#what">What data we collect</a></li>
            <li><a href="#why">Why we use it</a></li>
            <li><a href="#basis">Legal basis for processing</a></li>
            <li><a href="#share">Who we share it with</a></li>
            <li><a href="#minors">Children and guardians</a></li>
            <li><a href="#retain">How long we keep it</a></li>
            <li><a href="#rights">Your rights</a></li>
            <li><a href="#cookies">Cookies and tracking</a></li>
            <li><a href="#security">How we protect it</a></li>
            <li><a href="#international">International transfers</a></li>
            <li><a href="#changes">Changes to this policy</a></li>
            <li><a href="#contact">Grievance officer and contact</a></li>
          </ol>
        </div>

        <h2 id="who">1. Who we are</h2>
        <p>
          Rest Coder Academy is a live, project-based coding school
          operating from Jayanagar, Bengaluru, and offering full-stack
          engineering courses to school students, college students and
          working professionals. In this policy, &ldquo;we&rdquo;,
          &ldquo;us&rdquo; and &ldquo;the Academy&rdquo; refer to Rest
          Coder Academy, and &ldquo;you&rdquo; refers to any individual
          whose personal data we handle — website visitors, enquirers,
          enrolled students, and, where relevant, their parents or
          guardians.
        </p>
        <p>
          For the purposes of India&rsquo;s Digital Personal Data
          Protection Act, 2023 (&ldquo;DPDP Act&rdquo;), Rest Coder
          Academy is the Data Fiduciary for the data described in this
          policy.
        </p>

        <h2 id="what">2. What data we collect</h2>
        <p>We handle the following categories of personal data.</p>
        <h3>2.1 Given to us directly</h3>
        <ul>
          <li>
            <strong>Enquiries</strong> — your name, phone number, email
            address, level of experience, and the course or programme
            you are enquiring about, submitted through the enquiry or
            contact form on this website or by WhatsApp / phone to the
            numbers we publish.
          </li>
          <li>
            <strong>Enrolment</strong> — additional details a course
            reasonably requires such as your date of birth, current
            education status, and, for a minor, the name and contact of
            a parent or guardian.
          </li>
          <li>
            <strong>Student portal account</strong> — the email address
            you sign in with and any profile or progress data you or
            your instructor record inside the portal.
          </li>
          <li>
            <strong>Communications</strong> — messages you send us on
            WhatsApp, email, phone calls, or during a classroom
            interaction that is captured in a lesson recording or
            course artefact.
          </li>
        </ul>
        <h3>2.2 Collected automatically when you use the website</h3>
        <ul>
          <li>
            <strong>Device and usage information</strong> — IP address,
            browser type, referring page, pages viewed, and rough
            location inferred from your IP, collected through Google
            Analytics 4 and Meta Pixel.
          </li>
          <li>
            <strong>Advertising and conversion signals</strong> — when
            you click a Rest Coder Academy ad on Meta (Facebook /
            Instagram) or Google and land on our website, we receive
            the identifiers necessary to measure that click and any
            resulting enquiry or enrolment. See the Cookies section
            below for the specific tools involved.
          </li>
        </ul>
        <h3>2.3 Received from third parties</h3>
        <ul>
          <li>
            <strong>Payment processor</strong> — when you pay a course
            fee, our processor Razorpay confirms the outcome of the
            transaction to us (success, failure, amount, order
            reference). We do not receive or store your full card
            number or bank credentials.
          </li>
          <li>
            <strong>Employers</strong> — for placement-support students,
            an employer may share offer-letter details, joining status,
            and, with your consent, a testimonial or case study.
          </li>
        </ul>

        <h2 id="why">3. Why we use it</h2>
        <ul>
          <li>To respond to your enquiry and share course, batch and fee information.</li>
          <li>To enrol you in a course, run your batch, keep attendance, run assessments, and share weekly progress with a parent or guardian where you are a minor.</li>
          <li>To operate the student portal (authenticate you, show your lessons and progress, keep session state).</li>
          <li>To process fee payments through Razorpay.</li>
          <li>To provide placement support and, where applicable, share your candidacy details with an employer with your consent.</li>
          <li>To send you course-related updates, batch schedule changes, and, where you have opted in, information about new courses and offers.</li>
          <li>To measure the performance of our website and our advertising, and to improve both.</li>
          <li>To meet a legal or regulatory obligation, respond to a lawful request from a government authority, or exercise or defend a legal claim.</li>
        </ul>

        <h2 id="basis">4. Legal basis for processing</h2>
        <p>
          Under the DPDP Act we process your personal data either on
          the basis of the consent you have given us, or where the
          processing is necessary for a specified legitimate use —
          principally, performing an enrolment or service you have
          asked us to provide, complying with law, or responding to a
          medical or safety emergency. Where consent is our basis, you
          may withdraw it at any time, as described in Section 8.
        </p>

        <h2 id="share">5. Who we share it with</h2>
        <p>
          We do not sell your personal data to anyone. We share it only
          with the parties below, and only for the purposes described
          alongside them.
        </p>
        <ul>
          <li>
            <strong>Google LLC and Google India Private Limited</strong>
            — for website analytics (Google Analytics 4), advertising
            measurement (Google Ads conversion tracking), student-portal
            authentication (Firebase Authentication) and portal data
            storage.
          </li>
          <li>
            <strong>Meta Platforms, Inc. and Meta Platforms India LLC</strong>
            — for advertising measurement (Meta Pixel) on the website
            and for delivering, measuring, and publishing content on
            our official Facebook and Instagram accounts.
          </li>
          <li>
            <strong>Razorpay Software Private Limited</strong> — to
            process course-fee payments made on the website.
          </li>
          <li>
            <strong>WhatsApp / WhatsApp Business (owned by Meta)</strong>
            — where you initiate or continue a conversation with us on
            WhatsApp.
          </li>
          <li>
            <strong>Placement partners</strong> — employers to whom you
            have consented to your candidacy being shared.
          </li>
          <li>
            <strong>Cloud infrastructure and email providers</strong>
            supporting our website, portal, and business email.
          </li>
          <li>
            <strong>Auditors, legal advisors and government authorities</strong>
            where required by law.
          </li>
        </ul>
        <p>
          Each of the processors above is contractually bound to
          handle your data only for the purpose we engaged them for,
          and to maintain reasonable security controls.
        </p>

        <h2 id="minors">6. Children and guardians</h2>
        <p>
          Where a student is under 18 years of age, we process their
          personal data only with the consent of a parent or lawful
          guardian, and we do not track them for advertising purposes.
          A parent or guardian may exercise any of the rights in
          Section 8 on behalf of the minor by contacting the grievance
          officer named below.
        </p>

        <h2 id="retain">7. How long we keep it</h2>
        <ul>
          <li>
            <strong>Enquiry data</strong> we did not turn into an
            enrolment — 24 months from the last interaction, then
            deleted or anonymised.
          </li>
          <li>
            <strong>Student records</strong> for enrolled students —
            for the duration of the course and for three years after
            course completion, so we can support placement, issue or
            re-issue completion certificates, and answer verification
            requests from your employer.
          </li>
          <li>
            <strong>Financial records</strong> we are required to
            retain under tax and accounting law — for the statutory
            retention period (currently up to eight years).
          </li>
          <li>
            <strong>Analytics and advertising signals</strong> — as
            described in the retention settings of the underlying
            tools (Google Analytics 4 is currently set to 14 months by
            default; Meta Pixel retains events per Meta&rsquo;s
            published schedule).
          </li>
        </ul>

        <h2 id="rights">8. Your rights</h2>
        <p>Under the DPDP Act you have the right to:</p>
        <ul>
          <li>obtain a summary of the personal data of yours that we hold and the processing activities we carry out on it;</li>
          <li>have inaccurate or misleading personal data corrected, or completed if it is incomplete;</li>
          <li>have your personal data erased where it is no longer necessary for the purpose it was collected, subject to any legal or contractual retention obligation we have;</li>
          <li>withdraw consent that you previously gave — without affecting the lawfulness of processing carried out before the withdrawal;</li>
          <li>nominate another individual to exercise these rights on your behalf in the event of your death or incapacity;</li>
          <li>raise a grievance with our Grievance Officer, and, if unresolved, escalate it to the Data Protection Board of India.</li>
        </ul>
        <p>
          To exercise any of these rights, contact us using the
          details in Section 13. We aim to respond within 30 days.
        </p>

        <h2 id="cookies">9. Cookies and tracking</h2>
        <p>We use cookies and similar technologies for the following purposes:</p>
        <ul>
          <li>
            <strong>Necessary</strong> — to remember your portal
            login session and to serve the website reliably.
          </li>
          <li>
            <strong>Analytics</strong> — Google Analytics 4, to
            understand how the website is used at an aggregate level.
          </li>
          <li>
            <strong>Advertising and measurement</strong> — Meta Pixel
            and Google Ads conversion tracking, to measure and improve
            the ads we run for our courses.
          </li>
        </ul>
        <p>
          You can control cookies through your browser settings, and
          you can opt out of Google Analytics through Google&rsquo;s
          opt-out tools and out of personalised ads through your Meta
          and Google ad preferences.
        </p>

        <h2 id="security">10. How we protect it</h2>
        <p>
          We use reasonable organisational and technical measures to
          protect personal data against loss, unauthorised access, and
          misuse. Access to student records is restricted to Academy
          staff who need it. Payments run through Razorpay&rsquo;s
          PCI-DSS compliant infrastructure — we do not receive or
          store card or bank credentials. If a breach that puts your
          personal data at risk occurs, we will notify affected Data
          Principals and the Data Protection Board of India as
          required by the DPDP Act.
        </p>

        <h2 id="international">11. International transfers</h2>
        <p>
          Some of the processors we use (notably Google and Meta)
          operate global infrastructure and may process personal data
          outside India. These transfers happen only where the
          processor provides contractual protections we consider
          reasonable and to the extent permitted by the DPDP Act and
          any restrictions the Central Government notifies from time
          to time.
        </p>

        <h2 id="changes">12. Changes to this policy</h2>
        <p>
          We may update this policy from time to time. When we make a
          substantive change we will update the &ldquo;Effective&rdquo;
          date at the top of the page and, where the change materially
          affects how we handle your personal data, we will notify
          enrolled students by email in advance.
        </p>

        <h2 id="contact">13. Grievance officer and contact</h2>
        <div className="legal-contact">
          <p>
            <strong>Grievance Officer:</strong> Mr. Uday Pawar, Founder,
            Rest Coder Academy.
          </p>
          <p>
            <strong>Email:</strong>{" "}
            <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
          </p>
          <p>
            <strong>Phone:</strong>{" "}
            <a href={`tel:${PHONE_TEL}`}>{PHONE_DISPLAY}</a>
          </p>
          <p>
            <strong>Address:</strong> {ADDRESS.street},{" "}
            {ADDRESS.locality}, {ADDRESS.city}, {ADDRESS.region}{" "}
            {ADDRESS.postalCode}, India.
          </p>
          <p>
            If your grievance is not resolved to your satisfaction,
            you may escalate it to the Data Protection Board of India
            once it has been constituted and its complaint mechanism
            is operational.
          </p>
        </div>
      </main>
    </>
  );
}

export default PrivacyPolicy;
