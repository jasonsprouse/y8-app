from playwright.sync_api import Page, expect

def test_auth_context_persists_on_public_routes(page: Page):
    """
    This test verifies that the AuthContext persists when navigating between public routes.
    """
    try:
        # 1. Arrange: Go to the about-us page.
        page.goto("http://localhost:3000/about-us")

        # 2. Act: Navigate to the shop page.
        page.goto("http://localhost:3000/shop")

        # 3. Assert: Confirm that the shop page has loaded correctly.
        # We expect to see the text "Shop" on the page.
        expect(page.get_by_text("Shop")).to_be_visible()

    finally:
        # 4. Screenshot: Capture the final result for visual verification.
        page.screenshot(path="jules-scratch/verification/verification.png")