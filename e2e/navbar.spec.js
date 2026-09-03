import { test, expect } from "@playwright/test";

// Issue #5: at every width, exactly one navigation control should be usable —
// either the hamburger (which opens the drawer) or the inline nav links, never
// both, never neither.
const widths = [
  { width: 375, height: 800, hamburger: true },
  { width: 768, height: 1024, hamburger: true },
  { width: 1024, height: 800, hamburger: false },
  { width: 1440, height: 900, hamburger: false },
];

for (const { width, height, hamburger } of widths) {
  test(`exactly one nav is usable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/");

    const hamburgerButton = page.getByLabel("open drawer");
    const inlineApplyNow = page.getByRole("button", { name: /apply now/i });

    await expect(hamburgerButton).toBeVisible({ visible: hamburger });
    await expect(inlineApplyNow).toBeVisible({ visible: !hamburger });
  });
}

test("the hamburger actually opens the drawer at 375px", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto("/");
  await page.getByLabel("open drawer").click();
  // Scoped to the drawer panel — "Rest Coder Academy" also appears in the footer.
  await expect(page.locator(".MuiDrawer-paper").getByText("Rest Coder Academy")).toBeVisible();
});

test("the hamburger icon has contrast against the navbar background at 375px", async ({ page }) => {
  // Regression guard: the icon was briefly hardcoded to white while the navbar
  // background (Navbar.css `nav { background-color: white !important; }`) is
  // also white, making a technically-"visible" but unreadable white-on-white icon.
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto("/");

  const iconColor = await page
    .getByLabel("open drawer")
    .locator("svg")
    .evaluate((el) => getComputedStyle(el).color);
  const navBackground = await page
    .locator(".MuiAppBar-root")
    .evaluate((el) => getComputedStyle(el).backgroundColor);

  expect(iconColor).not.toBe(navBackground);
});
