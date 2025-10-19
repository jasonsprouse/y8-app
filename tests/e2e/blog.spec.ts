import { test, expect } from '@playwright/test';

test.describe('Blog', () => {
  test('should navigate to the blog and view a post', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('http://localhost:3000/blog');

    // Check that the blog page is loaded by checking for the specific H1
    await expect(page.getByRole('heading', { name: 'Blog' })).toBeVisible();

    // Get the title of the first post
    const postLink = page.locator('a[href^="/blog/"]').first();
    const postTitle = await postLink.textContent();
    expect(postTitle).toBeTruthy();

    // Click on the first blog post
    await postLink.click();

    // Check that the blog post is loaded and the title is correct
    await expect(page.getByRole('heading', { name: postTitle! })).toBeVisible();
    await expect(page.locator('article')).toBeVisible();
  });
});