import { test, expect } from "@playwright/test";

test("homepage loads", async ({ page }) => {
  const res = await page.goto("/");
  expect(res.status()).toBeLessThan(400);
  await expect(page).toHaveTitle(/Rest Coder Academy/i);
});

test("/api/batches returns a JSON array (the live data endpoint)", async ({ request }) => {
  const res = await request.get("/api/batches");
  expect(res.status()).toBe(200);
  expect(Array.isArray(await res.json())).toBe(true);
});

test("/admin is password-protected (401)", async ({ request }) => {
  expect((await request.get("/admin")).status()).toBe(401);
  expect((await request.get("/admin/batches")).status()).toBe(401);
});

test("book-a-seat CTA launches checkout directly (no form)", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /book your seat/i }).first().click();
  // No form on our side — it opens Razorpay directly. Without keys the order is
  // 503, so the launcher shows the opening/opening-soon state (never a form).
  await expect(
    page.getByText(/opening secure checkout|enrolment is opening soon/i)
  ).toBeVisible();
});

test("apply CTA opens the enquiry form", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /apply now|register now/i }).first().click();
  await expect(page.getByRole("button", { name: /submit|sending/i })).toBeVisible();
});

test("/api/enroll/order is inert until Razorpay keys are set (503)", async ({ request }) => {
  const res = await request.post("/api/enroll/order", { data: { course: "fde" } });
  expect(res.status()).toBe(503);
});
