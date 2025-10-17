from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Navigate to the NPE page
    page.goto("http://localhost:3000/npe", timeout=60000)

    # Wait for the heading to be visible
    heading = page.get_by_role("heading", name="NPE Management")
    expect(heading).to_be_visible()

    # Take a screenshot
    page.screenshot(path="jules-scratch/verification/npe-page.png")

    context.close()
    browser.close()

with sync_playwright() as playwright:
    run(playwright)