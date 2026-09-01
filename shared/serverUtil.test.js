import { describe, it, expect } from "vitest";
import {
  escapeHtml,
  isValidBatchDate,
  safeEqual,
  parseBasicAuth,
  requireAdminAuth,
} from "./serverUtil.js";

describe("escapeHtml (XSS)", () => {
  it("escapes the dangerous characters", () => {
    expect(escapeHtml(`<script>alert('x')&"</script>`)).toBe(
      "&lt;script&gt;alert(&#39;x&#39;)&amp;&quot;&lt;/script&gt;"
    );
  });
  it("neutralises a stored-XSS payload in a lead message", () => {
    const out = escapeHtml('<img src=x onerror="steal()">');
    expect(out).not.toContain("<img");
    expect(out).toContain("&lt;img");
  });
  it("handles null/undefined/numbers", () => {
    expect(escapeHtml(null)).toBe("");
    expect(escapeHtml(undefined)).toBe("");
    expect(escapeHtml(42)).toBe("42");
  });
});

describe("isValidBatchDate (DD-MM-YYYY)", () => {
  it("accepts a real date", () => {
    expect(isValidBatchDate("16-09-2026")).toBe(true);
  });
  it("rejects rollover dates (31 April)", () => {
    expect(isValidBatchDate("31-04-2026")).toBe(false);
    expect(isValidBatchDate("29-02-2027")).toBe(false); // not a leap year
  });
  it("accepts a valid leap day", () => {
    expect(isValidBatchDate("29-02-2028")).toBe(true);
  });
  it("rejects wrong shape / out of range / junk", () => {
    for (const bad of ["", "2026-09-16", "16/09/2026", "16-13-2026", "00-09-2026", "16-09-26", "abc", "16-09"]) {
      expect(isValidBatchDate(bad), bad).toBe(false);
    }
  });
});

describe("safeEqual (constant-time compare)", () => {
  it("true only for identical strings", () => {
    expect(safeEqual("s3cret", "s3cret")).toBe(true);
    expect(safeEqual("s3cret", "s3creT")).toBe(false);
    expect(safeEqual("s3cret", "s3cre")).toBe(false); // different length
    expect(safeEqual("", "")).toBe(true);
  });
});

describe("parseBasicAuth", () => {
  it("parses a valid Basic header", () => {
    const h = "Basic " + btoa("admin:p@ss:word"); // pass may contain ':'
    expect(parseBasicAuth(h)).toEqual({ user: "admin", pass: "p@ss:word" });
  });
  it("returns null for missing/malformed", () => {
    expect(parseBasicAuth("")).toBeNull();
    expect(parseBasicAuth("Bearer xyz")).toBeNull();
    expect(parseBasicAuth("Basic not-base64!!")).toBeNull();
    expect(parseBasicAuth("Basic " + btoa("nocolon"))).toBeNull();
  });
});

describe("requireAdminAuth (fails closed)", () => {
  const auth = (env, header) =>
    requireAdminAuth(new Request("https://x/admin", header ? { headers: { Authorization: header } } : {}), env);

  it("401s when no ADMIN_PASSWORD is configured (fail closed)", () => {
    const r = auth({}, "Basic " + btoa("admin:anything"));
    expect(r.status).toBe(401);
  });
  it("401s with no / wrong credentials", () => {
    const env = { ADMIN_PASSWORD: "secret" };
    expect(auth(env, null).status).toBe(401);
    expect(auth(env, "Basic " + btoa("admin:wrong")).status).toBe(401);
    expect(auth(env, "Basic " + btoa("root:secret")).status).toBe(401);
  });
  it("passes (returns null) with correct credentials", () => {
    expect(auth({ ADMIN_PASSWORD: "secret" }, "Basic " + btoa("admin:secret"))).toBeNull();
  });
  it("sends a WWW-Authenticate challenge", () => {
    const r = auth({ ADMIN_PASSWORD: "secret" }, null);
    expect(r.headers.get("WWW-Authenticate")).toMatch(/^Basic /);
  });
});
