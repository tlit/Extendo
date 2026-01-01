import { test, expect } from '../fixtures';

test('Set 1: Core E2E Flow', async ({ page, extensionId }) => {
    // 1. Visit target page
    await page.goto('https://example.com');

    // 2. Open Extension
    const popupUrl = `chrome-extension://${extensionId}/index.html?testing=true`;
    const popup = await page.context().newPage();
    popup.on('console', msg => console.log('POPUP LOG:', msg.text()));
    await popup.goto(popupUrl);

    // 3. Type Prompt
    await popup.getByPlaceholder('Describe change...').fill('TEST_SCENARIO:COLOR_RED');
    await popup.getByTestId('submit-btn').click();

    // 5. Verify No Error
    const bodyText = await popup.locator('body').textContent();
    if (bodyText?.includes('Error:')) {
        console.error("Test Failed with UI Error:", bodyText);
    }
    await expect(popup.getByText(/Error:/)).not.toBeVisible();

    // 6. Verify Chat Response
    await expect(popup.getByText('Test Mode: Changing background to red')).toBeVisible();
});
