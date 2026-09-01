import { describe, it, expect } from "vitest";
import { onRequestPost as enquiryPost } from "../functions/api/enquiry.js";
import { onRequestGet as batchesGet } from "../functions/api/batches.js";
import { onRequestGet as adminGet } from "../functions/admin.js";
import { onRequestPost as batchAdminPost } from "../functions/admin/batches.js";

// Fake D1 — mocks only the DB boundary (prepare/bind/run/all), so tests exercise
// the real handler logic without a live database and without flake.
function makeDB(seed = {}) {
  const t = { enquiries: [...(seed.enquiries || [])], batches: [...(seed.batches || [])] };
  let ids = { enquiries: 1000, batches: 1000 };
  return {
    tables: t,
    prepare(sql) {
      let args = [];
      const stmt = {
        bind(...a) { args = a; return stmt; },
        async run() {
          if (/INSERT INTO enquiries/i.test(sql))
            t.enquiries.push({ id: ++ids.enquiries, fullname: args[0], mobile: args[1], email: args[2], experience: args[3], message: args[4] });
          else if (/INSERT INTO batches/i.test(sql))
            t.batches.push({ id: ++ids.batches, name: args[0], date: args[1], day: args[2], time: args[3], trainer: args[4], duration: args[5], mode: args[6], contact: args[7], sort_order: args[8], status: args[9] });
          else if (/UPDATE batches/i.test(sql)) {
            const row = t.batches.find((b) => String(b.id) === String(args[args.length - 1]));
            if (row) Object.assign(row, { name: args[0], date: args[1], day: args[2], time: args[3], trainer: args[4], duration: args[5], mode: args[6], contact: args[7], sort_order: args[8], status: args[9] });
          } else if (/DELETE FROM batches/i.test(sql)) {
            t.batches = t.batches.filter((b) => String(b.id) !== String(args[0]));
          }
          return { success: true };
        },
        async all() {
          if (/FROM batches/i.test(sql)) {
            let rows = t.batches;
            if (/status\s*=\s*'active'/i.test(sql)) rows = rows.filter((b) => (b.status || "active") === "active");
            return { results: rows };
          }
          if (/FROM enquiries/i.test(sql)) return { results: t.enquiries };
          return { results: [] };
        },
      };
      return stmt;
    },
  };
}
const ctx = (request, env) => ({ request, env });
const authH = (u = "admin", p = "secret") => ({ Authorization: "Basic " + btoa(`${u}:${p}`) });
const jsonReq = (body) =>
  new Request("https://x/api/enquiry", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
const formReq = (url, obj) =>
  new Request(url, { method: "POST", headers: { ...authH(), "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(obj).toString() });

describe("POST /api/enquiry", () => {
  it("stores a valid enquiry (201)", async () => {
    const db = makeDB();
    const res = await enquiryPost(ctx(jsonReq({ fullname: "Asha", mobile: "9000000000", email: "a@b.c", experience: "Fresher", message: "hi" }), { DB: db }));
    expect(res.status).toBe(201);
    expect(db.tables.enquiries).toHaveLength(1);
    expect(db.tables.enquiries[0].fullname).toBe("Asha");
  });
  it("400 when required fields are missing", async () => {
    const res = await enquiryPost(ctx(jsonReq({ fullname: "", mobile: "" }), { DB: makeDB() }));
    expect(res.status).toBe(400);
  });
  it("400 on invalid JSON body", async () => {
    const req = new Request("https://x/api/enquiry", { method: "POST", body: "not json" });
    const res = await enquiryPost(ctx(req, { DB: makeDB() }));
    expect(res.status).toBe(400);
  });
  it("500 when storage is not configured", async () => {
    const res = await enquiryPost(ctx(jsonReq({ fullname: "A", mobile: "9" }), {}));
    expect(res.status).toBe(500);
  });
});

describe("GET /api/batches", () => {
  it("returns batches as JSON", async () => {
    const db = makeDB({ batches: [{ id: 1, name: "Java Full Stack", date: "16-09-2026" }] });
    const res = await batchesGet(ctx(new Request("https://x/api/batches"), { DB: db }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data[0].name).toBe("Java Full Stack");
  });
  it("fails soft to [] when storage is unavailable", async () => {
    const res = await batchesGet(ctx(new Request("https://x/api/batches"), {}));
    expect(await res.json()).toEqual([]);
  });
  it("returns only ACTIVE batches, with the weekday computed from the date", async () => {
    const db = makeDB({
      batches: [
        { id: 1, name: "Java Full Stack", date: "16-09-2026", day: "WRONGDAY", status: "active" },
        { id: 2, name: "Hidden Course", date: "23-09-2026", status: "hidden" },
      ],
    });
    const data = await (await batchesGet(ctx(new Request("https://x/api/batches"), { DB: db }))).json();
    expect(data).toHaveLength(1); // hidden one excluded
    expect(data[0].name).toBe("Java Full Stack");
    expect(data[0].day).toBe("Wednesday"); // computed — overrides the stored "WRONGDAY"
  });
});

describe("GET /admin (enquiries)", () => {
  const env = (db) => ({ DB: db, ADMIN_PASSWORD: "secret" });
  it("401 without / with wrong credentials", async () => {
    const db = makeDB();
    expect((await adminGet(ctx(new Request("https://x/admin"), env(db)))).status).toBe(401);
    expect((await adminGet(ctx(new Request("https://x/admin", { headers: authH("admin", "wrong") }), env(db)))).status).toBe(401);
  });
  it("401 fail-closed when ADMIN_PASSWORD is unset", async () => {
    const res = await adminGet(ctx(new Request("https://x/admin", { headers: authH() }), { DB: makeDB() }));
    expect(res.status).toBe(401);
  });
  it("200 with correct auth, and escapes a stored-XSS lead message", async () => {
    const db = makeDB({ enquiries: [{ id: 1, fullname: "X", mobile: "9", email: "", experience: "", message: "<script>alert(1)</script>", created_at: "2026-09-20" }] });
    const res = await adminGet(ctx(new Request("https://x/admin", { headers: authH() }), env(db)));
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;");
  });
});

describe("POST /admin/batches (CRUD)", () => {
  const env = (db) => ({ DB: db, ADMIN_PASSWORD: "secret" });
  it("401 without auth", async () => {
    const req = new Request("https://x/admin/batches", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: "action=add" });
    expect((await batchAdminPost(ctx(req, env(makeDB())))).status).toBe(401);
  });
  it("adds a batch with a valid date (303 ok)", async () => {
    const db = makeDB();
    const res = await batchAdminPost(ctx(formReq("https://x/admin/batches", { action: "add", name: "Java Full Stack", date: "16-09-2026", day: "Wednesday", sort_order: "1" }), env(db)));
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toContain("ok=");
    expect(db.tables.batches).toHaveLength(1);
    expect(db.tables.batches[0].date).toBe("16-09-2026");
  });
  it("rejects an invalid (rollover) date — no row added (303 err)", async () => {
    const db = makeDB();
    const res = await batchAdminPost(ctx(formReq("https://x/admin/batches", { action: "add", name: "Java", date: "31-04-2026" }), env(db)));
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toContain("err=");
    expect(db.tables.batches).toHaveLength(0);
  });
  it("stores status=hidden and DERIVES the weekday when adding (Pavan's improvements)", async () => {
    const db = makeDB();
    const res = await batchAdminPost(ctx(formReq("https://x/admin/batches", { action: "add", name: "X", date: "16-09-2026", status: "hidden" }), env(db)));
    expect(res.status).toBe(303);
    expect(db.tables.batches).toHaveLength(1);
    expect(db.tables.batches[0].status).toBe("hidden");
    expect(db.tables.batches[0].day).toBe("Wednesday"); // derived from 16-09-2026, not entered
  });
  it("deletes a batch by id", async () => {
    const db = makeDB({ batches: [{ id: 5, name: "X", date: "16-09-2026" }] });
    const res = await batchAdminPost(ctx(formReq("https://x/admin/batches", { action: "delete", id: "5" }), env(db)));
    expect(res.status).toBe(303);
    expect(db.tables.batches).toHaveLength(0);
  });
});
