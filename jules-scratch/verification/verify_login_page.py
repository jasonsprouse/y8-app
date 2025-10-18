from playwright.sync_api import Page, expect

def test_login_page_loads(page: Page):
    """
    This test verifies that the login page loads correctly.
    """
    try:
        # 1. Arrange: Go to the homepage.
        page.goto("http://localhost:3000")

        # Print the page title for debugging
        print(f"Page title: {page.title()}")

        # 2. Assert: Confirm the login component is visible.
        # We expect to see the text "Sign in with" on the page.
        expect(page.get_by_text("Sign in with")).to_be_visible()

    finally:
        # 3. Screenshot: Capture the final result for visual verification.
        page.screenshot(path="jules-scratch/verification/verification.png")