import { describe, it, expect, afterEach, vi } from "vitest";
import { trackPurchase, trackBeginCheckout, trackLead } from "./analytics";

// vitest runs in the "node" environment (no global window), so stub it per-test.
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("analytics (GA4 events)", () => {
  describe("trackPurchase", () => {
    it("fires a GA4 purchase event with the right payload", () => {
      const gtag = vi.fn();
      vi.stubGlobal("window", { gtag });
      const ok = trackPurchase({
        transactionId: "pay_ABC123",
        value: 35000,
        courseId: "java-fs",
        courseName: "Java Full Stack",
      });
      expect(ok).toBe(true);
      expect(gtag).toHaveBeenCalledWith("event", "purchase", {
        transaction_id: "pay_ABC123",
        currency: "INR",
        value: 35000,
        items: [
          {
            item_id: "java-fs",
            item_name: "Java Full Stack",
            price: 35000,
            quantity: 1,
          },
        ],
      });
    });

    it("coerces a non-numeric value to 0 rather than sending NaN", () => {
      const gtag = vi.fn();
      vi.stubGlobal("window", { gtag });
      trackPurchase({
        transactionId: "pay_1",
        value: undefined,
        courseId: "x",
        courseName: "X",
      });
      const [, , params] = gtag.mock.calls[0];
      expect(params.value).toBe(0);
      expect(params.items[0].price).toBe(0);
    });
  });

  describe("trackLead", () => {
    it("fires a GA4 generate_lead event tagged with the source method", () => {
      const gtag = vi.fn();
      vi.stubGlobal("window", { gtag });
      const ok = trackLead("enquiry_form");
      expect(ok).toBe(true);
      expect(gtag).toHaveBeenCalledWith("event", "generate_lead", {
        method: "enquiry_form",
      });
    });

    it("is a safe no-op when gtag is unavailable", () => {
      vi.stubGlobal("window", {});
      expect(trackLead("whatsapp_float")).toBe(false);
    });
  });

  describe("trackBeginCheckout", () => {
    it("fires a GA4 begin_checkout event", () => {
      const gtag = vi.fn();
      vi.stubGlobal("window", { gtag });
      const ok = trackBeginCheckout({
        value: 50000,
        courseId: "fde",
        courseName: "FDE",
      });
      expect(ok).toBe(true);
      expect(gtag).toHaveBeenCalledWith("event", "begin_checkout", {
        currency: "INR",
        value: 50000,
        items: [
          { item_id: "fde", item_name: "FDE", price: 50000, quantity: 1 },
        ],
      });
    });
  });

  describe("when gtag is unavailable (blocked / not yet loaded)", () => {
    it("is a safe no-op and never throws when window has no gtag", () => {
      vi.stubGlobal("window", {});
      expect(() =>
        trackPurchase({
          transactionId: "p",
          value: 1,
          courseId: "c",
          courseName: "C",
        }),
      ).not.toThrow();
      expect(
        trackPurchase({
          transactionId: "p",
          value: 1,
          courseId: "c",
          courseName: "C",
        }),
      ).toBe(false);
      expect(
        trackBeginCheckout({ value: 1, courseId: "c", courseName: "C" }),
      ).toBe(false);
    });

    it("swallows a throwing gtag instead of breaking the caller", () => {
      vi.stubGlobal("window", {
        gtag: () => {
          throw new Error("gtag boom");
        },
      });
      expect(() =>
        trackPurchase({
          transactionId: "p",
          value: 1,
          courseId: "c",
          courseName: "C",
        }),
      ).not.toThrow();
      expect(
        trackPurchase({
          transactionId: "p",
          value: 1,
          courseId: "c",
          courseName: "C",
        }),
      ).toBe(false);
    });
  });
});
