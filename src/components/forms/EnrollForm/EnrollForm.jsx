import { Box, CircularProgress } from "@mui/material";
import React, { useMemo, useState } from "react";
import InputBoxComponent from "../../atoms/InputBoxComponent/InputBoxComponent";
import DropdownComponent from "../../atoms/DropdownComponent/DropdownComponent";
import TypoGraphyComponent from "../../atoms/TypoGraphyComponent/TypoGraphyComponent";
import ButtonComponent from "../../atoms/ButtonComponent/ButtonComponent";
import { useAuth } from "../../../App";
import { regex } from "../../../regex/regex";
import { useBatches } from "../../organism/Batches/useBatches";
import { isBatchUpcoming, formatBatchDateShort } from "../../organism/Batches/batchDateUtils";
import { getReferral, loadRazorpay, createOrder, verifyPayment, registerInterest } from "./enrollApi";
import "./EnrollForm.css";

const EXPERIENCE_OPTIONS = [
  { label: "Working professional - Technical roles", id: 1 },
  { label: "Working professional - Non technical", id: 2 },
  { label: "College student - Final year", id: 3 },
  { label: "College student - 1st to pre-final year", id: 4 },
  { label: "Others", id: 5 },
];

function EnrollForm({ course }) {
  const { closeEnroll, notify } = useAuth();
  const batches = useBatches();
  const paid = !!(course && course.paid);

  const [data, setData] = useState({
    fullname: "", mobile: "", email: "", experience: "", batch: "", referral: getReferral(),
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState("");
  const [done, setDone] = useState(""); // "" | "paid" | "registered"

  // Upcoming batches for this course, for the (optional) batch selector.
  const batchOptions = useMemo(
    () =>
      (batches || [])
        .filter((b) => b.name === course.name && isBatchUpcoming(b.date))
        .map((b, i) => ({
          id: i + 1,
          label: `${b.day ? b.day + " · " : ""}${formatBatchDateShort(b.date)}${b.time ? " · " + b.time : ""}`,
        })),
    [batches, course]
  );

  const change = ({ target: { name, value } }) => setData((d) => ({ ...d, [name]: value }));
  const changeExp = (v) => setData((d) => ({ ...d, experience: v.label }));
  const changeBatch = (v) => setData((d) => ({ ...d, batch: v.label }));

  function validate() {
    const e = {};
    if (!data.fullname) e.fullname = "Full Name is Required";
    else if (data.fullname.length < 3) e.fullname = "Full Name should be more than 3 characters";
    else if (!regex.nameRegex.test(data.fullname)) e.fullname = "Full Name Should Contain Only Alphabets";
    if (!data.mobile) e.mobile = "Mobile is Required";
    else if (!regex.mobileRegex.test(data.mobile)) e.mobile = "Invalid Mobile Number";
    if (!data.email) e.email = "Email is Required";
    else if (!regex.emailRegex.test(data.email)) e.email = "Invalid Email";
    return e;
  }

  const payload = () => ({
    course: course.courseId,
    course_name: course.name,
    fullname: data.fullname,
    mobile: data.mobile,
    email: data.email,
    experience: data.experience,
    batch: data.batch,
    referral: data.referral,
  });

  async function handleSubmit(ev) {
    ev.preventDefault();
    if (busy) return;
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    setFailed("");
    setBusy(true);
    try {
      if (paid) await payFlow();
      else await registerFlow();
    } catch {
      setBusy(false);
      setFailed("Something went wrong. Please try again, or message us on WhatsApp.");
    }
  }

  async function registerFlow() {
    const r = await registerInterest(payload());
    setBusy(false);
    if (r.ok) {
      setDone("registered");
      notify && notify("Seat registered — we'll be in touch!");
    } else {
      setFailed(r.body.error || "Could not register. Please try again.");
    }
  }

  async function payFlow() {
    const order = await createOrder(course.courseId, data.referral);
    // Payments not enabled yet → save their interest so nothing is lost.
    if (order.status === 503) {
      const r = await registerInterest(payload());
      setBusy(false);
      if (r.ok) setDone("registered");
      else setFailed("Enrolment is opening soon — please message us on WhatsApp to reserve your seat.");
      return;
    }
    if (!order.ok || !order.body.orderId) {
      setBusy(false);
      setFailed(order.body.error || "Could not start payment. Please try again.");
      return;
    }
    const loaded = await loadRazorpay();
    if (!loaded || !window.Razorpay) {
      setBusy(false);
      setFailed("Could not load the payment window. Check your connection and try again.");
      return;
    }
    const rzp = new window.Razorpay({
      key: order.body.keyId,
      order_id: order.body.orderId,
      amount: order.body.amount,
      currency: order.body.currency,
      name: "Rest Coder Academy",
      description: course.name,
      image: "/favicon.png",
      prefill: { name: data.fullname, email: data.email, contact: data.mobile },
      notes: { course: course.courseId, referral: data.referral },
      theme: { color: "var(--rca-navy)" },
      handler: async (resp) => {
        const v = await verifyPayment({ ...resp, ...payload() });
        setBusy(false);
        if (v.ok && v.body.ok) {
          setDone("paid");
          notify && notify("Enrolment confirmed! 🎉");
        } else {
          setFailed(
            "Your payment went through but we couldn't confirm it here. Keep your payment ID and message us — we'll sort it out."
          );
        }
      },
      modal: { ondismiss: () => setBusy(false) },
    });
    rzp.on("payment.failed", () => {
      setBusy(false);
      setFailed("Payment failed or was cancelled. You can try again.");
    });
    rzp.open();
  }

  if (done) {
    const isPaid = done === "paid";
    return (
      <Box className="enroll-form enroll-done">
        <TypoGraphyComponent component="h6" variant="h6" text={isPaid ? "Your seat is booked 🎉" : "You're registered ✅"} />
        <TypoGraphyComponent
          component="p"
          variant="body2"
          text={
            isPaid
              ? `₹${Number(course.price).toLocaleString("en-IN")} received. A receipt is on its way to your email and WhatsApp — we'll call you within a day to confirm your batch.`
              : "Thanks! We've saved your details and the team will reach out with the next steps and dates."
          }
        />
        <ButtonComponent label="Done" onBtnClick={closeEnroll} />
      </Box>
    );
  }

  return (
    <form className="enroll-form" onSubmit={handleSubmit}>
      <Box className="form-heading">
        <Box>
          <TypoGraphyComponent component="h6" variant="h6" text={paid ? "Book your seat" : "Register your seat"} />
          <TypoGraphyComponent component="p" variant="body2" text={course.name} />
        </Box>
        <ButtonComponent paddingX={1} paddingY={1} onBtnClick={closeEnroll}>
          ×
        </ButtonComponent>
      </Box>

      {paid && (
        <Box className="enroll-price">
          <span className="amt">₹{Number(course.price).toLocaleString("en-IN")}</span>
          <span className="emi">EMI available at checkout</span>
        </Box>
      )}

      <Box className="enroll-fields">
        <InputBoxComponent value={data.fullname} label="Full Name" variant="outlined" onChange={change} name="fullname" error={!!errors.fullname} helperText={errors.fullname} />
        <InputBoxComponent value={data.mobile} label="Mobile" variant="outlined" onChange={change} name="mobile" error={!!errors.mobile} helperText={errors.mobile} />
        <InputBoxComponent value={data.email} label="Email" variant="outlined" onChange={change} name="email" error={!!errors.email} helperText={errors.email} />
        <DropdownComponent label="Experience" options={EXPERIENCE_OPTIONS} name="experience" onChange={changeExp} value={EXPERIENCE_OPTIONS} />
        {batchOptions.length > 0 && (
          <DropdownComponent label="Preferred batch" options={batchOptions} name="batch" onChange={changeBatch} value={batchOptions} />
        )}

        <Box className="enroll-referral">
          <InputBoxComponent
            value={data.referral}
            label="Referral code (optional)"
            variant="outlined"
            onChange={change}
            name="referral"
          />
        </Box>

        {failed && (
          <Box className="enroll-error" role="alert">
            <TypoGraphyComponent component="p" variant="body2" text={failed} />
          </Box>
        )}

        <ButtonComponent
          type="submit"
          fullWidth
          disabled={busy}
          label={busy ? "" : paid ? `Pay ₹${Number(course.price).toLocaleString("en-IN")} securely` : "Register my seat"}
        >
          {busy && <CircularProgress size={20} sx={{ color: "var(--rca-surface)" }} />}
        </ButtonComponent>
        {paid && (
          <TypoGraphyComponent
            component="p"
            variant="caption"
            text="Secured by Razorpay · UPI, cards, net banking · EMI"
          />
        )}
      </Box>
    </form>
  );
}

export default EnrollForm;
