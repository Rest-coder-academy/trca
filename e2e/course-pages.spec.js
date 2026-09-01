import { test, expect } from "@playwright/test";

// Issue #8: per-course pages, deep-linkable and reachable from the homepage.
test("course card links through to its course page", async ({ page }) => {
  await page.goto("/");
  // Scoped to the Courses section — the same course name also appears as a
  // heading in the Batches section further down the page.
  await page.locator(".courses").getByRole("heading", { name: "Java Full Stack" }).click();
  await expect(page).toHaveURL(/\/courses\/java-full-stack$/);
  await expect(page.getByRole("heading", { name: "Java Full Stack", level: 1 })).toBeVisible();
});

test("course page loads directly via a deep link (no client-side nav)", async ({ page }) => {
  const res = await page.goto("/courses/mern-stack");
  expect(res.status()).toBeLessThan(400);
  await expect(page.getByRole("heading", { name: "MERN Stack", level: 1 })).toBeVisible();
  // Syllabus content from courses.js should render.
  await expect(page.getByText("MongoDB")).toBeVisible();
});

test("an unknown course slug redirects home instead of 404ing blank", async ({ page }) => {
  await page.goto("/courses/does-not-exist");
  await expect(page).toHaveURL(/\/$/);
});

// Regression guard: before routing, every path unconditionally rendered
// Home. Adding <Routes> without a catch-all meant any path outside "/" and
// "/courses/:slug" (a typo, a stale bookmark, anything else Cloudflare
// Pages' SPA fallback serves index.html for) rendered a blank content area.
test("an unrelated unknown path redirects home instead of rendering blank", async ({ page }) => {
  await page.goto("/about");
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator(".courses")).toBeVisible();
});

test("back button returns from a course page to the homepage", async ({ page }) => {
  await page.goto("/");
  await page.locator(".courses").getByRole("heading", { name: "Python Full Stack" }).click();
  await expect(page).toHaveURL(/\/courses\/python-full-stack$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
});

test("Enquire Now on a course page pre-fills the course in the message", async ({ page }) => {
  await page.goto("/courses/java-full-stack");
  await page.getByRole("button", { name: /enquire now/i }).click();
  const message = page.locator('textarea[name="message"]');
  await expect(message).toHaveValue(/Java Full Stack/);
});

test("navbar logo returns to the homepage from a course page", async ({ page }) => {
  await page.goto("/courses/java-full-stack");
  await page.locator('a[href="/"] img').click();
  await expect(page).toHaveURL(/\/$/);
});

// Regression guard: openModal's signature changed to accept an optional
// prefill message. Any pre-existing CTA that still passes it unwrapped as an
// onClick/onBtnClick handler gets called with the click SyntheticEvent as
// that argument instead — corrupting the enquiry message with a stray event
// object rather than leaving it blank.
test("Apply Now in the navbar opens the enquiry form with an empty message", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /apply now/i }).click();
  await expect(page.locator('textarea[name="message"]')).toHaveValue("");
});

test("Register Now in the hero opens the enquiry form with an empty message", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /register now/i }).click();
  await expect(page.locator('textarea[name="message"]')).toHaveValue("");
});

// Batch cards whose name matches a course in courses.js now funnel into the
// Enroll flow (see #40) — only a batch with no matching course still falls
// back to the enquiry form. "Reactjs & Nextjs" is that batch in the static
// fallback data.
test("Enquire Now on a batch card without a matching course pre-fills that batch's course name", async ({ page }) => {
  await page.goto("/");
  await page
    .locator(".batches .card", { hasText: "Reactjs & Nextjs" })
    .getByRole("button", { name: /enquire now|join the waitlist/i })
    .click();
  await expect(page.locator('textarea[name="message"]')).toHaveValue(/I'm interested in the .+ course\./);
});

// Regression guard: React Router doesn't reset scroll position on navigation
// by default, so clicking a course card while scrolled down the homepage
// landed on the new page at that same pixel offset instead of the top.
test("clicking a course card scrolls the new page to the top", async ({ page }) => {
  await page.goto("/");
  await page.mouse.wheel(0, 2000);
  await page.locator(".courses").getByRole("heading", { name: "Java Full Stack" }).click();
  await expect(page).toHaveURL(/\/courses\/java-full-stack$/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(50);
});

test("clicking the syllabus preview on a card (not just the title) also navigates through", async ({ page }) => {
  await page.goto("/");
  await page.locator(".courses").getByText("Core Java").click();
  await expect(page).toHaveURL(/\/courses\/java-full-stack$/);
});
