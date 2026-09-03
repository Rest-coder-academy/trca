import { Box, CircularProgress } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import TypoGraphyComponent from "../../atoms/TypoGraphyComponent/TypoGraphyComponent";
import ButtonComponent from "../../atoms/ButtonComponent/ButtonComponent";
import { useAuth } from "../../../App";
import {
  getReferral,
  loadRazorpay,
  createOrder,
  verifyPayment,
} from "./enrollApi";
import { trackBeginCheckout, trackPurchase } from "../../../lib/analytics";
import "./EnrollForm.css";

// No form. "Book your seat" opens Razorpay Checkout directly — Razorpay collects
// the student's phone + email + payment, and the server reads those back from
// the verified payment (functions/api/enroll/verify.js). This component is only
// the launcher + result: a spinner while checkout opens, then the booked
// confirmation (or an error with retry). The "talk to a counsellor" path (a
// separate button on the card) is where detailed enquiries are gathered.
function EnrollForm({ course }) {
  const { closeEnroll, notify } = useAuth();
  const [phase, setPhase] = useState("launching"); // launching | done | failed
  const [failed, setFailed] = useState("");
  const started = useRef(false);
  const settled = useRef(false); // paid+confirmed — so a late ondismiss can't close it

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    startCheckout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function fail(msg) {
    setFailed(msg);
    setPhase("failed");
  }

  async function startCheckout() {
    setFailed("");
    setPhase("launching");
    const referral = getReferral();

    let order;
    try {
      order = await createOrder(course.courseId, referral);
    } catch {
      return fail("Something went wrong starting checkout. Please try again.");
    }
    if (order.status === 503) {
      return fail(
        "Enrolment is opening soon — please use “Talk to a counsellor” or message us on WhatsApp to reserve your seat.",
      );
    }
    if (!order.ok || !order.body.orderId) {
      return fail(
        order.body.error || "Could not start payment. Please try again.",
      );
    }

    const loaded = await loadRazorpay();
    if (!loaded || !window.Razorpay) {
      return fail(
        "Could not load the payment window. Check your connection and try again.",
      );
    }

    const rzp = new window.Razorpay({
      key: order.body.keyId,
      order_id: order.body.orderId,
      amount: order.body.amount,
      currency: order.body.currency,
      name: "Rest Coder Academy",
      description: course.name,
      image: "/favicon.png",
      notes: { course: course.courseId, referral },
      theme: { color: "#03084C" },
      handler: async (resp) => {
        try {
          const v = await verifyPayment({
            razorpay_order_id: resp.razorpay_order_id,
            razorpay_payment_id: resp.razorpay_payment_id,
            razorpay_signature: resp.razorpay_signature,
            course: course.courseId,
            course_name: course.name,
            referral,
          });
          if (v.ok && v.body.ok) {
            settled.current = true;
            // GA4 revenue event — server has verified the payment. value uses
            // course.price (same price map the server charges from).
            trackPurchase({
              transactionId: resp.razorpay_payment_id,
              value: course.price,
              courseId: course.courseId,
              courseName: course.name,
            });
            setPhase("done");
            notify && notify("Enrolment confirmed! 🎉");
          } else {
            fail(
              "Your payment went through but we couldn't confirm it here. Keep your payment ID and message us — we'll sort it out.",
            );
          }
        } catch {
          fail(
            "Your payment went through but we couldn't confirm it here. Keep your payment ID and message us — we'll sort it out.",
          );
        }
      },
      modal: {
        // Closed Razorpay without paying → close our launcher too (unless a
        // payment already settled, in which case the confirmation is showing).
        ondismiss: () => {
          if (!settled.current) closeEnroll();
        },
      },
    });
    rzp.on("payment.failed", () =>
      fail("Payment failed or was cancelled. You can try again."),
    );
    // GA4 funnel start — checkout is opening (measures intent vs. completed purchase).
    trackBeginCheckout({
      value: course.price,
      courseId: course.courseId,
      courseName: course.name,
    });
    rzp.open();
  }

  if (phase === "done") {
    return (
      <Box className="enroll-form enroll-done">
        <TypoGraphyComponent
          component="h6"
          variant="h6"
          text="Your seat is booked 🎉"
        />
        <TypoGraphyComponent
          component="p"
          variant="body2"
          text={`₹${Number(course.price).toLocaleString("en-IN")} received. A receipt is on its way to your email and WhatsApp — we'll call you within a day to confirm your batch.`}
        />
        <ButtonComponent label="Done" onBtnClick={closeEnroll} />
      </Box>
    );
  }

  if (phase === "failed") {
    return (
      <Box className="enroll-form">
        <Box className="form-heading">
          <Box>
            <TypoGraphyComponent
              component="h6"
              variant="h6"
              text="Couldn't complete checkout"
            />
            <TypoGraphyComponent
              component="p"
              variant="body2"
              text={course.name}
            />
          </Box>
          <ButtonComponent paddingX={1} paddingY={1} onBtnClick={closeEnroll}>
            ×
          </ButtonComponent>
        </Box>
        <Box className="enroll-error" role="alert">
          <TypoGraphyComponent component="p" variant="body2" text={failed} />
        </Box>
        <ButtonComponent
          label="Try again"
          fullWidth
          onBtnClick={startCheckout}
        />
      </Box>
    );
  }

  // launching
  return (
    <Box className="enroll-form enroll-launching">
      <TypoGraphyComponent
        component="h6"
        variant="h6"
        text="Opening secure checkout…"
      />
      <TypoGraphyComponent
        component="p"
        variant="body2"
        text={`${course.name} · ₹${Number(course.price).toLocaleString("en-IN")}`}
      />
      <Box className="enroll-spinner">
        <CircularProgress size={30} sx={{ color: "var(--rca-navy)" }} />
      </Box>
      <TypoGraphyComponent
        component="p"
        variant="caption"
        text="Razorpay will ask for your phone, email and payment. Secured by Razorpay · UPI, cards, net banking · EMI."
      />
    </Box>
  );
}

EnrollForm.propTypes = {
  course: PropTypes.shape({
    courseId: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number,
    paid: PropTypes.bool,
  }).isRequired,
};

export default EnrollForm;
