import React from "react";
import { Link } from "react-router-dom";
import SocialMeta from "../atoms/SocialMeta/SocialMeta";
import {
  ADDRESS,
  EMAIL,
  PHONE_DISPLAY,
  PHONE_TEL,
} from "../../data/contact";
import "./Legal.css";

/**
 * /terms — RCA's terms of use.
 *
 * Written by Claude for founder review before Meta app submission
 * (task #80). Covers eligibility, enrolment, fees + refund, course
 * conduct, use of the student portal, IP of course content, placement
 * expectations (no guarantees), suspension, governing law. Sits
 * alongside the privacy policy as the second required document for
 * Meta's Instagram Graph API app review submission.
 *
 * Awaiting Uday Pawar review + explicit merge approval before deploy.
 */

const ORIGIN = "https://restcoderacademy.in";
const EFFECTIVE_DATE = "26 September 2026";

function Terms() {
  const url = `${ORIGIN}/terms`;
  const title = "Terms of Use — Rest Coder Academy";
  const description =
    "Terms of use governing enrolment in Rest Coder Academy courses, use of the student portal, fee payment, refunds, placement support, and disputes.";

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <SocialMeta title={title} description={description} url={url} />

      <main className="legal">
        <span className="legal-eyebrow">Legal</span>
        <h1>Terms of Use</h1>
        <p className="legal-meta">
          Effective {EFFECTIVE_DATE}. These terms govern your use of
          restcoderacademy.in, the Rest Coder Academy student portal,
          and enrolment in any course we offer. Please read them
          carefully — by enquiring, enrolling, or using the portal you
          accept them.
        </p>

        <div className="legal-toc" aria-label="On this page">
          <ol>
            <li><a href="#who">Who these terms are between</a></li>
            <li><a href="#eligibility">Eligibility</a></li>
            <li><a href="#enrol">Enrolment and start of a course</a></li>
            <li><a href="#fees">Fees, payment, and taxes</a></li>
            <li><a href="#refund">Cancellation and refund</a></li>
            <li><a href="#attend">Attendance and conduct</a></li>
            <li><a href="#portal">The student portal</a></li>
            <li><a href="#ip">Course materials and intellectual property</a></li>
            <li><a href="#placement">Placement support</a></li>
            <li><a href="#privacy">Privacy</a></li>
            <li><a href="#suspend">Suspension and termination</a></li>
            <li><a href="#disclaimer">Disclaimers</a></li>
            <li><a href="#liability">Limitation of liability</a></li>
            <li><a href="#changes">Changes to these terms</a></li>
            <li><a href="#law">Governing law and disputes</a></li>
            <li><a href="#contact">Contact us</a></li>
          </ol>
        </div>

        <h2 id="who">1. Who these terms are between</h2>
        <p>
          These terms are an agreement between you (the enquirer,
          student, or user of our website and student portal) and Rest
          Coder Academy, a coding school operating from Jayanagar,
          Bengaluru. Where a student is under 18 years of age, a
          parent or lawful guardian accepts these terms on the
          student&rsquo;s behalf and remains responsible for the
          obligations set out below.
        </p>

        <h2 id="eligibility">2. Eligibility</h2>
        <p>
          Rest Coder Academy welcomes school students, college
          students, and working professionals. Some courses have a
          minimum age or prerequisite that will be stated on the
          course page or communicated at enrolment. By enrolling, you
          confirm that the information you provided (age, education
          status, work experience where relevant) is accurate.
        </p>

        <h2 id="enrol">3. Enrolment and start of a course</h2>
        <p>
          A place in a batch is confirmed only after we acknowledge
          your enrolment and receive the fee (or the first instalment
          of an EMI plan). Batch start dates, timings, and the mode of
          delivery — currently offline at our Jayanagar campus — are
          shared with you at enrolment. If a batch is postponed or
          cancelled by us, we will offer you the next available batch
          or a full refund at your choice.
        </p>

        <h2 id="fees">4. Fees, payment, and taxes</h2>
        <p>
          Course fees are as stated on the course page at the time of
          enrolment. Payments are processed through Razorpay Software
          Private Limited; EMI, UPI, cards, and net-banking options
          available depend on Razorpay and your bank. Any taxes that
          apply to the fee are the student&rsquo;s responsibility unless
          otherwise stated. Where an EMI has been agreed and an
          instalment is delinquent, we may pause portal access until
          the instalment is cleared.
        </p>

        <h2 id="refund">5. Cancellation and refund</h2>
        <p>Our refund policy is:</p>
        <ul>
          <li>
            <strong>Before your batch starts</strong> — you may cancel
            up to seven (7) days before the announced batch start date
            for a full refund, less any non-recoverable payment-gateway
            fees.
          </li>
          <li>
            <strong>Within seven days after batch start</strong> — you
            may withdraw within the first seven days of the batch for
            a fifty per cent (50%) refund of the fee paid.
          </li>
          <li>
            <strong>After seven days of batch start</strong> — the
            fee is non-refundable, other than in cases where we cancel
            or discontinue the batch.
          </li>
          <li>
            <strong>If we cancel a batch or programme</strong> — a
            full refund of amounts paid for that batch is made to the
            original payment method within fourteen (14) working days.
          </li>
        </ul>
        <p>
          Refund requests should be sent to the email address in
          Section 16. This policy sits alongside any additional
          protection your payment method or law offers you.
        </p>

        <h2 id="attend">6. Attendance and conduct</h2>
        <p>
          Our courses are live and cohort-based. Regular attendance and
          honest effort on assignments and assessments are what make
          the course work for you and for your batchmates. We ask that
          you:
        </p>
        <ul>
          <li>attend classes on time, or inform your instructor if you cannot;</li>
          <li>do your own work — plagiarism, contract cheating, or misuse of AI tools to submit work you have not understood or produced yourself may lead to loss of course credit;</li>
          <li>treat instructors, staff, and other students with respect. Harassment, discrimination, threats, or unsafe behaviour of any kind is a ground for suspension without refund; and</li>
          <li>respect campus rules, including any recording, health-and-safety, and equipment-usage policies communicated on site.</li>
        </ul>

        <h2 id="portal">7. The student portal</h2>
        <p>
          The student portal at{" "}
          <Link to="/portal/login">/portal</Link> is provided to
          enrolled students for the purpose of taking a course. Access
          is personal and non-transferable. You are responsible for
          keeping your account credentials confidential and for any
          activity that happens under your account. You must not:
        </p>
        <ul>
          <li>share your account or credentials with anyone else;</li>
          <li>attempt to gain unauthorised access to the portal, other users&rsquo; accounts, or the underlying infrastructure;</li>
          <li>upload malicious code, or use the portal to send spam or content that infringes the rights of any other person;</li>
          <li>download, copy, redistribute, or resell course videos, materials, or code repositories in whole or in part.</li>
        </ul>
        <p>
          We may log portal activity for security, audit, and
          course-quality purposes as described in our{" "}
          <Link to="/privacy-policy">Privacy Policy</Link>.
        </p>

        <h2 id="ip">8. Course materials and intellectual property</h2>
        <p>
          All course videos, slide decks, notes, code samples,
          assignments, evaluation rubrics, and other course materials
          — together with the Rest Coder Academy name, logo, and
          website — belong to Rest Coder Academy or its licensors and
          are protected by copyright and other laws. You get a
          personal, non-exclusive, non-transferable licence to use
          them for the duration of your course and for the purpose of
          learning from them. Any other use — public distribution,
          commercial re-use, republishing to other platforms — needs
          our written permission.
        </p>
        <p>
          Work you create in a course (for example, a project you
          build in class) is yours. We may, with your permission,
          reference your project in placement conversations and in
          marketing about the Academy.
        </p>

        <h2 id="placement">9. Placement support</h2>
        <p>
          Placement support is part of every course. It includes
          mock interviews, resume and profile review, referrals to
          employers we work with, and case-study coaching. Placement
          support is not, and cannot be, a guarantee of a job or of a
          particular salary. Outcomes depend on your own effort,
          performance in interviews, and market conditions at the
          time. Testimonials or case studies on our website reflect
          the experience of individual students and are not a promise
          that you will have the same experience.
        </p>

        <h2 id="privacy">10. Privacy</h2>
        <p>
          How we handle your personal data is described in our{" "}
          <Link to="/privacy-policy">Privacy Policy</Link>. That
          policy is part of these terms.
        </p>

        <h2 id="suspend">11. Suspension and termination</h2>
        <p>
          We may suspend or terminate your access to a course or the
          portal if you materially breach these terms — including,
          without limitation, non-payment of fees due, plagiarism,
          harassment of instructors or peers, or misuse of the
          portal. Where a breach is capable of remedy we will normally
          give you notice and an opportunity to fix it first. Where a
          suspension or termination is our decision, refunds (if any)
          will follow the policy in Section 5.
        </p>

        <h2 id="disclaimer">12. Disclaimers</h2>
        <p>
          The website and portal are provided on an &ldquo;as
          available&rdquo; basis. We aim to keep them online and
          working correctly, but we do not warrant that they will be
          uninterrupted or error-free, that all defects will be
          corrected, or that they will be free of viruses or harmful
          components. Links to third-party sites (for example, in
          course notes or on the blog) are for convenience only; we
          do not endorse or take responsibility for their content.
        </p>

        <h2 id="liability">13. Limitation of liability</h2>
        <p>
          To the extent permitted by applicable law, our total
          liability to you in connection with a course is limited to
          the amount you have paid us for that course in the twelve
          (12) months preceding the event giving rise to the claim.
          We are not liable for indirect or consequential loss,
          including loss of anticipated earnings or job offers.
          Nothing in these terms limits any liability that cannot be
          limited under Indian law.
        </p>

        <h2 id="changes">14. Changes to these terms</h2>
        <p>
          We may update these terms from time to time. When we make a
          material change we will update the &ldquo;Effective&rdquo;
          date at the top of this page and, where the change affects
          existing enrolments, notify affected students by email in
          advance.
        </p>

        <h2 id="law">15. Governing law and disputes</h2>
        <p>
          These terms are governed by the laws of India. Any dispute
          arising from or in connection with them will be subject to
          the exclusive jurisdiction of the courts at Bengaluru,
          Karnataka. We would rather resolve any concern directly and
          quickly — please contact us before starting a formal
          dispute.
        </p>

        <h2 id="contact">16. Contact us</h2>
        <div className="legal-contact">
          <p>
            <strong>Rest Coder Academy</strong>
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
        </div>
      </main>
    </>
  );
}

export default Terms;
