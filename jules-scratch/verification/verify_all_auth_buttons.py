import re
from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Go to the home page
        page.goto("http://localhost:3000/", timeout=60000)

        # Verify Google button
        google_button = page.get_by_role("button", name="Continue with Google")
        expect(google_button).to_be_visible()
        google_button.click()
        page.wait_for_load_state("networkidle")
        expect(page).to_have_url(re.compile("accounts.google.com"))
        page.goto("http://localhost:3000/")


        # Verify Discord button
        discord_button = page.get_by_role("button", name="Continue with Discord")
        expect(discord_button).to_be_visible()
        discord_button.click()
        page.wait_for_load_state("networkidle")
        expect(page).to_have_url(re.compile("discord.com.*oauth2/authorize"))
        page.goto("http://localhost:3000/")

        # Verify WebAuthn button
        webauthn_button = page.get_by_role("button", name="Continue with WebAuthn")
        expect(webauthn_button).to_be_visible()
        webauthn_button.click()
        page.wait_for_selector("button:has-text('Register with WebAuthn')")
        expect(page.get_by_text("Register with WebAuthn")).to_be_visible()
        page.screenshot(path="jules-scratch/verification/final-verification.png")


        browser.close()

if __name__ == "__main__":
    run()