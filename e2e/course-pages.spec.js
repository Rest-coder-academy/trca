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
