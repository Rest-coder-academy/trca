import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

// Guards public/sitemap.xml. A stray Git merge-conflict marker once shipped
// here and made the whole sitemap unparseable in Search Console — these checks
// catch that (and other malformed-XML slips) before they reach production.
const __dirname = dirname(fileURLToPath(import.meta.url));
const sitemap = readFileSync(resolve(__dirname, "../public/sitemap.xml"), "utf8");

describe("public/sitemap.xml", () => {
  it("has no unresolved merge-conflict markers", () => {
    expect(sitemap).not.toMatch(/^(<{7}|={7}|>{7})/m);
  });

  it("is a well-formed sitemap: xml declaration + urlset wrapper", () => {
    expect(sitemap.trimStart()).toMatch(/^<\?xml/);
    expect(sitemap).toContain("<urlset");
    expect(sitemap).toContain("</urlset>");
  });

  it("has balanced <url> / <loc> tags", () => {
    const urls = (sitemap.match(/<url>/g) || []).length;
    const urlCloses = (sitemap.match(/<\/url>/g) || []).length;
    const locs = (sitemap.match(/<loc>/g) || []).length;
    expect(urls).toBeGreaterThan(0);
    expect(urlCloses).toBe(urls);
    expect(locs).toBe(urls);
  });

  it("every <loc> is an absolute https://restcoderacademy.in URL, with no duplicates", () => {
    const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    for (const loc of locs) {
      expect(loc).toMatch(/^https:\/\/restcoderacademy\.in\//);
    }
    expect(new Set(locs).size).toBe(locs.length); // no duplicate URLs
  });
});
