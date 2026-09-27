/**
 * The dead-URL guard (#151).
 *
 * `www.restcoderacademy.com` was baked into every social graphic RCA has
 * published, and nothing could tell anyone it was wrong. These tests are what
 * stops it coming back: a graphic that renders the dead domain, or renders no
 * domain at all, fails CI instead of going out on Instagram.
 */
import { describe, it, expect } from "vitest";
import { readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { SITE_URL, PHONE_PRIMARY, PHONE_SECONDARY, HANDLE } from "../design/social-templates/brand.js";

const DIR = resolve(dirname(fileURLToPath(import.meta.url)), "../design/social-templates/templates");
const files = readdirSync(DIR).filter((f) => f.endsWith(".js") && !f.startsWith("_"));
const mods = await Promise.all(files.map(async (f) => import(join(DIR, f))));

describe("the URL on every social graphic", () => {
  it("finds every recurring template", () => {
    expect(mods.map((m) => m.meta.id).sort()).toEqual([
      "batch-launch",
      "festival-greeting",
      "placement-testimonial",
      "teaching-moment",
    ]);
  });

  it.each(mods.map((m) => [m.meta.id, m]))("%s watermarks the live domain", (_id, mod) => {
    expect(mod.render()).toContain(SITE_URL);
  });

  it.each(mods.map((m) => [m.meta.id, m]))("%s never prints the dead .com", (_id, mod) => {
    const svg = mod.render();
    expect(svg).not.toMatch(/restcoderacademy\.com/i);
    // `www.` would send a prospect through the www→apex 301 from #15.
    // Scoped to the domain: the SVG namespace URI is http://www.w3.org/…
    expect(svg).not.toMatch(/www\.restcoderacademy/i);
    // The existing graphics print a bare domain; #151 asks not to add one.
    expect(svg).not.toMatch(/https?:\/\/restcoderacademy/i);
  });

  it("carries both audited phone numbers on the placement template", () => {
    const svg = mods.find((m) => m.meta.id === "placement-testimonial").render();
    expect(svg).toContain(PHONE_PRIMARY);
    expect(svg).toContain(PHONE_SECONDARY);
  });
});

describe("templates survive the data they will actually be given", () => {
  const placement = mods.find((m) => m.meta.id === "placement-testimonial");

  it("renders valid, non-empty SVG for every template's defaults", () => {
    for (const m of mods) {
      const svg = m.render();
      expect(svg.startsWith("<svg")).toBe(true);
      expect(svg).toContain('viewBox="0 0 1080 1080"');
    }
  });

  it("collapses the salary badge rather than leaving an empty box", () => {
    // The pill, not the colour — orange is also the rule above the bottom bar.
    expect(placement.render()).toContain('rx="29"');
    expect(placement.render({ salary: "" })).not.toContain('rx="29"');
  });

  it("escapes text instead of letting it break the document", () => {
    const svg = placement.render({ name: 'A & B <script>"x"' });
    expect(svg).toContain("&amp;");
    expect(svg).toContain("&lt;script&gt;");
    expect(svg).not.toContain("<script>");
  });

  it("truncates a testimonial that would otherwise run off the canvas", () => {
    const svg = placement.render({ quote: "word ".repeat(200) });
    expect(svg).toContain("…");
  });

  it("lays out a batch with three features without leaving a gap for a fourth", () => {
    const batch = mods.find((m) => m.meta.id === "batch-launch");
    const three = batch.render({ features: ["A", "B", "C"] });
    expect(three).toContain(">A</text>");
    expect(three).toContain(">C</text>");
    expect(three).not.toContain(">D</text>");
  });
});

describe("teaching moment (#296)", () => {
  const tm = mods.find((m) => m.meta.id === "teaching-moment");

  it("renders every sample with the phone, handle and live URL", () => {
    for (const data of Object.values(tm.samples)) {
      const svg = tm.render(data);
      expect(svg).toContain("TEACHING MOMENT");
      expect(svg).toContain(SITE_URL);
      expect(svg).toContain(PHONE_PRIMARY);
      expect(svg).toContain(HANDLE);
      expect(svg).toContain(data.cohort);
    }
  });

  it("steps the headline down before giving up on a long concept", () => {
    const short = tm.render({ concept: "Recursion" });
    const long = tm.render({ concept: "A LEFT JOIN keeps every row on the left table, matched or not, always" });
    expect(short).toContain('font-size="72"');
    expect(long).not.toContain('font-size="72"');
  });

  it("refuses a concept or expansion too long to fit, rather than truncating it", () => {
    expect(() => tm.render({ concept: "word ".repeat(40) })).toThrow(/concept needs/);
    expect(() => tm.render({ expansion: "word ".repeat(60) })).toThrow(/expansion needs/);
  });

  it.each(["passionate", "Driven", "thought leader", "Delighted to announce", "excited to share", "unpack", "DEEP   DIVE"])(
    "rejects the banned phrase %s",
    (phrase) => {
      expect(() => tm.render({ expansion: `We ${phrase} it` })).toThrow(/banned phrase/);
    },
  );

  it("keeps LinkedIn English-only and emoji-free, and lets IG have both", () => {
    expect(() => tm.render({ variant: "linkedin", concept: "Recursion \u{1F680}" })).toThrow(/emoji/);
    expect(() => tm.render({ variant: "linkedin", concept: "ಕನ್ನಡ recursion" })).toThrow(/non-Latin/);
    expect(() => tm.render({ variant: "linkedin", concept: "Café — “quoted”" })).not.toThrow();
    expect(() => tm.render({ variant: "ig", concept: "Recursion \u{1F680} maadi" })).not.toThrow();
    expect(() => tm.render({ variant: "x" })).toThrow(/variant/);
  });
});
