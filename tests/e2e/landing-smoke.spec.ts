import { test, expect } from '@playwright/test';

test.describe('Landing smoke tests', () => {
  test('opens waitlist modal from hero CTA', async ({ page }) => {
    await page.goto('/');

    await page
      .getByRole('button', { name: 'Claim Your Early Access Spot' })
      .click();

    await expect(
      page.getByRole('heading', { name: 'Join the Waitlist' })
    ).toBeVisible();

    await page.getByRole('button', { name: 'Close' }).click();
    await expect(
      page.getByRole('heading', { name: 'Join the Waitlist' })
    ).not.toBeVisible();
  });

  test('submits contact form with mocked API', async ({ page }) => {
    await page.route('**/api/contact', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: "We'll get back to you soon.",
        }),
      });
    });

    await page.goto('/');

    await page.getByRole('button', { name: 'Contact Support' }).click();
    await expect(page.getByRole('heading', { name: 'Get in Touch' })).toBeVisible();

    await page.fill('input[name="name"]', 'QA Lead');
    await page.fill('input[name="company"]', 'Bengaluru Pilot Co');
    await page.fill('input[name="phone"]', '9988776655');
    await page.fill('input[name="email"]', 'qa@example.com');
    await page.click('button:has-text("Send Message")');

    await expect(
      page.getByText("Message sent! We'll respond soon.")
    ).toBeVisible();

    await page.getByRole('button', { name: 'Close' }).click();
  });
});

