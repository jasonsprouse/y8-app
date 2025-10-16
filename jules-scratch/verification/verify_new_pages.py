from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Navigate to the NPE page
    page.goto("http://localhost:3000/npe", timeout=60000)
    page.wait_for_selector("h1")
    page.screenshot(path="jules-scratch/verification/npe-page.png")

    # Navigate to the Sales page
    page.goto("http://localhost:3000/sales", timeout=60000)
    page.wait_for_selector("h1")
    page.screenshot(path="jules-scratch/verification/sales-page.png")

    # Navigate to the Marketing page
    page.goto("http://localhost:3000/marketing", timeout=60000)
    page.wait_for_selector("h1")
    page.screenshot(path="jules-scratch/verification/marketing-page.png")

    context.close()
    browser.close()

with sync_playwright() as playwright:
    run(playwright)