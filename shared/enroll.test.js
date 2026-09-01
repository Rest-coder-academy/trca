import { describe, it, expect } from "vitest";
import { priceForCourse, verifyRazorpaySignature } from "./enroll.js";

// Reproduce Razorpay's signature the same way the server verifies it, so we can
// feed a genuinely-valid signature to the verifier in tests.
async function sign(orderId, paymentId, secret) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = await crypto.subtle.sign("HMAC", key, enc.encode(`${orderId}|${paymentId}`));
  return [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

describe("priceForCourse (server-side source of truth)", () => {
  it("returns the FDE price in paise", () => {
    expect(priceForCourse("fde")).toBe(5000000);
  });
  it("returns null for a course with no online price", () => {
    expect(priceForCourse("java-fs")).toBeNull();
    expect(priceForCourse("")).toBeNull();
    expect(priceForCourse(undefined)).toBeNull();
  });
});

describe("verifyRazorpaySignature", () => {
  const secret = "test_secret_key";
  it("accepts a correctly-signed payment", async () => {
    const sig = await sign("order_abc", "pay_123", secret);
    expect(await verifyRazorpaySignature("order_abc", "pay_123", sig, secret)).toBe(true);
  });
  it("rejects a tampered signature", async () => {
    const sig = await sign("order_abc", "pay_123", secret);
    expect(await verifyRazorpaySignature("order_abc", "pay_999", sig, secret)).toBe(false);
    expect(await verifyRazorpaySignature("order_abc", "pay_123", sig.slice(0, -1) + "0", secret)).toBe(false);
  });
  it("rejects the wrong secret", async () => {
    const sig = await sign("order_abc", "pay_123", secret);
    expect(await verifyRazorpaySignature("order_abc", "pay_123", sig, "other_secret")).toBe(false);
  });
  it("rejects missing pieces", async () => {
    expect(await verifyRazorpaySignature("", "pay", "sig", secret)).toBe(false);
    expect(await verifyRazorpaySignature("order", "pay", "sig", "")).toBe(false);
  });
});
