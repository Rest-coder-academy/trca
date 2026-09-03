import { describe, it, expect } from "vitest";
import { signSession, verifySession, readCookie, getSession, sessionCookie } from "./auth.js";

const SECRET = "portal_session_secret";

describe("session sign/verify (HS256)", () => {
  it("round-trips a payload", async () => {
    const t = await signSession({ uid: 7, email: "a@b.c", role: "student" }, SECRET);
    const p = await verifySession(t, SECRET);
    expect(p.uid).toBe(7);
    expect(p.email).toBe("a@b.c");
    expect(p.role).toBe("student");
    expect(p.exp).toBeGreaterThan(p.iat);
  });
  it("rejects a tampered token", async () => {
    const t = await signSession({ uid: 7 }, SECRET);
    expect(await verifySession(t.slice(0, -1) + (t.endsWith("A") ? "B" : "A"), SECRET)).toBeNull();
  });
  it("rejects the wrong secret", async () => {
    const t = await signSession({ uid: 7 }, SECRET);
    expect(await verifySession(t, "other")).toBeNull();
  });
  it("rejects an expired token", async () => {
    const t = await signSession({ uid: 7 }, SECRET, -10); // already expired
    expect(await verifySession(t, SECRET)).toBeNull();
  });
  it("rejects junk / missing", async () => {
    expect(await verifySession("", SECRET)).toBeNull();
    expect(await verifySession("a.b", SECRET)).toBeNull();
    expect(await verifySession("a.b.c.d", SECRET)).toBeNull();
    expect(await verifySession(await signSession({ uid: 1 }, SECRET), "")).toBeNull();
  });
});

describe("cookie helpers", () => {
  it("reads the session cookie from the request", () => {
    const req = new Request("https://x/portal", { headers: { cookie: "foo=1; rca_session=abc.def.ghi; bar=2" } });
    expect(readCookie(req)).toBe("abc.def.ghi");
    expect(readCookie(new Request("https://x/portal"))).toBeNull();
  });
  it("sessionCookie is HttpOnly + Secure", () => {
    const c = sessionCookie("tok");
    expect(c).toMatch(/HttpOnly/);
    expect(c).toMatch(/Secure/);
    expect(c).toMatch(/SameSite=Lax/);
  });
  it("getSession returns the payload for a valid cookie, null otherwise", async () => {
    const tok = await signSession({ uid: 9, role: "instructor" }, SECRET);
    const req = new Request("https://x/portal", { headers: { cookie: `rca_session=${tok}` } });
    const p = await getSession(req, { SESSION_SECRET: SECRET });
    expect(p.uid).toBe(9);
    expect(p.role).toBe("instructor");
    expect(await getSession(new Request("https://x/portal"), { SESSION_SECRET: SECRET })).toBeNull();
  });
});
