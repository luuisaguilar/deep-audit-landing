import { test, expect } from "@playwright/test";

/**
 * E2E: Auth + Dashboard access flows
 *
 * Set PLAYWRIGHT_TEST_EMAIL / PLAYWRIGHT_TEST_PASSWORD env vars to enable
 * the authenticated tests. Without them, only the unauthenticated guard
 * tests run (which require no credentials).
 */

const TEST_EMAIL = process.env.PLAYWRIGHT_TEST_EMAIL;
const TEST_PASSWORD = process.env.PLAYWRIGHT_TEST_PASSWORD;

// ─── Unauthenticated guard (no credentials needed) ───────────────────────────

test("landing page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Deep Audit/i);
  await expect(page.locator("h1").first()).toBeVisible();
});

test("unauthenticated /dashboard redirects to /auth", async ({ page }) => {
  await page.goto("/dashboard");
  await page.waitForURL(/\/auth/);
  expect(page.url()).toContain("/auth");
});

test("/auth page renders login form", async ({ page }) => {
  await page.goto("/auth");
  await expect(page.locator("input[type='email']")).toBeVisible();
  await expect(page.locator("input[type='password']")).toBeVisible();
  // Submit button exists
  await expect(page.locator("button[type='submit']")).toBeVisible();
});

test("/privacy page loads", async ({ page }) => {
  await page.goto("/privacy");
  await expect(page.locator("h1")).toContainText("Privacidad");
});

test("/terms page loads", async ({ page }) => {
  await page.goto("/terms");
  await expect(page.locator("h1")).toContainText("Terminos");
});

// ─── Authenticated flows (requires env vars) ──────────────────────────────────

test.describe("authenticated", () => {
  test.skip(!TEST_EMAIL || !TEST_PASSWORD, "Set PLAYWRIGHT_TEST_EMAIL and PLAYWRIGHT_TEST_PASSWORD to run");

  test("login with valid credentials reaches dashboard", async ({ page }) => {
    await page.goto("/auth");

    await page.fill("input[type='email']", TEST_EMAIL!);
    await page.fill("input[type='password']", TEST_PASSWORD!);
    await page.click("button[type='submit']");

    // Should redirect to /dashboard after successful login
    await page.waitForURL(/\/dashboard/, { timeout: 15_000 });
    expect(page.url()).toContain("/dashboard");
  });

  test("dashboard main page renders key sections", async ({ page }) => {
    await page.goto("/auth");
    await page.fill("input[type='email']", TEST_EMAIL!);
    await page.fill("input[type='password']", TEST_PASSWORD!);
    await page.click("button[type='submit']");
    await page.waitForURL(/\/dashboard/, { timeout: 15_000 });

    // Sidebar or navigation should be present
    await expect(page.locator("nav, aside, [data-testid='sidebar']").first()).toBeVisible();
  });

  test("invalid credentials shows error", async ({ page }) => {
    await page.goto("/auth");
    await page.fill("input[type='email']", "notauser@example.com");
    await page.fill("input[type='password']", "wrongpassword123");
    await page.click("button[type='submit']");

    // Error message should appear — stays on /auth
    await expect(page.locator("text=/invalid|incorrect|error/i").first()).toBeVisible({ timeout: 8_000 });
    expect(page.url()).toContain("/auth");
  });

  test("logged-in user visiting /auth redirects to /dashboard", async ({ page }) => {
    // Login first
    await page.goto("/auth");
    await page.fill("input[type='email']", TEST_EMAIL!);
    await page.fill("input[type='password']", TEST_PASSWORD!);
    await page.click("button[type='submit']");
    await page.waitForURL(/\/dashboard/, { timeout: 15_000 });

    // Navigate back to /auth — should bounce to /dashboard
    await page.goto("/auth");
    await page.waitForURL(/\/dashboard/, { timeout: 8_000 });
    expect(page.url()).toContain("/dashboard");
  });
});
