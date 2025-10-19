import { test, expect } from '@playwright/test';

test.describe('Web3 Wallet Connection', () => {
  test('should display connect wallet button and open Web3Modal', async ({ page }) => {
    test.setTimeout(60000);
    
    // Navigate to the home page
    await page.goto('http://localhost:3000/');

    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot of the initial state
    await page.screenshot({ path: '/tmp/wallet-page-initial.png', fullPage: true });

    // Look for the "Connect your web3 wallet" heading
    const walletHeading = page.getByRole('heading', { name: /connect your web3 wallet/i });
    await expect(walletHeading).toBeVisible({ timeout: 10000 });

    // Look for the Connect Wallet button
    const connectButton = page.getByRole('button', { name: /connect wallet/i });
    await expect(connectButton).toBeVisible();

    // Take a screenshot showing the button
    await page.screenshot({ path: '/tmp/wallet-button-visible.png', fullPage: true });

    // Click the Connect Wallet button
    await connectButton.click();

    // Wait a moment for any modal or UI change
    await page.waitForTimeout(2000);

    // Take a screenshot after clicking
    await page.screenshot({ path: '/tmp/wallet-after-click.png', fullPage: true });

    // Log any console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Browser console error:', msg.text());
      }
    });

    // Check network requests
    page.on('requestfailed', request => {
      console.log('Failed request:', request.url(), request.failure()?.errorText);
    });
  });

  test('should check for client-side errors', async ({ page }) => {
    const errors: string[] = [];
    
    // Capture console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Capture page errors
    page.on('pageerror', error => {
      errors.push(error.message);
    });

    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');

    // Wait for potential errors to surface
    await page.waitForTimeout(3000);

    // Log all errors found
    if (errors.length > 0) {
      console.log('\n=== CLIENT ERRORS FOUND ===');
      errors.forEach((error, index) => {
        console.log(`Error ${index + 1}:`, error);
      });
      console.log('=== END CLIENT ERRORS ===\n');
    } else {
      console.log('No client errors detected');
    }

    // Take a screenshot
    await page.screenshot({ path: '/tmp/client-errors-check.png', fullPage: true });
  });
});
