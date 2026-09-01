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

test("enquiry CTA opens the form", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /enquire/i }).first().click();
  await expect(page.getByRole("button", { name: /submit|sending/i })).toBeVisible();
});
