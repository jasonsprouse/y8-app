from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()
    page.goto("http://localhost:3000/shop", timeout=120000) # Increased timeout

    # Wait for the "Shop" heading to be visible
    expect(page.get_by_role("heading", name="Shop")).to_be_visible()

    page.screenshot(path="jules-scratch/verification/verification.png")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)