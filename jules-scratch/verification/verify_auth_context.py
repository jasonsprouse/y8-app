from playwright.sync_api import Page, expect

def test_auth_context_persists(page: Page):
    """
    This test verifies that the AuthContext persists when navigating between public routes.
    """
    # 1. Arrange: Go to the about-us page.
    page.goto("http://localhost:3000/about-us")

    # 2. Act: Navigate to the shop page.
    page.goto("http://localhost:3000/shop")

    # 3. Assert: Check the console for the "AuthProvider rendered" message.
    # We expect to see the message only once, when the application is first loaded.
    console_messages = []
    page.on("console", lambda msg: console_messages.append(msg.text()))

    # Give the page some time to load and log messages
    page.wait_for_timeout(1000)

    auth_provider_renderings = [msg for msg in console_messages if "AuthProvider rendered" in msg]
    assert len(auth_provider_renderings) == 1, f"Expected AuthProvider to render once, but it rendered {len(auth_provider_renderings)} times."

    # 4. Screenshot: Capture the final result for visual verification.
    page.screenshot(path="jules-scratch/verification/verification.png")