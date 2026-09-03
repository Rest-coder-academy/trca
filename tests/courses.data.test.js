import { describe, it, expect } from "vitest";
import { courses } from "../src/components/organism/courses/courses.js";

// The course routes (/courses/:slug) resolve against these slugs, and the
// sitemap lists them — so a missing or duplicate slug silently breaks a page.
describe("course routing data", () => {
  it("every course has a unique, url-safe slug", () => {
    const slugs = courses.map((c) => c.slug);
    expect(slugs.every(Boolean)).toBe(true);
    expect(new Set(slugs).size).toBe(slugs.length); // no duplicates
    slugs.forEach((s) => expect(s).toMatch(/^[a-z0-9-]+$/));
  });

  it("every course has a courseId and a name", () => {
    courses.forEach((c) => {
      expect(c.courseId).toBeTruthy();
      expect(c.name).toBeTruthy();
    });
  });
});
