import { test, expect } from '../fixtures';

test.describe('Visual Regression', () => {
    test('Popup Initial State', async ({ page, extensionId }) => {
        const popup = await page.context().newPage();
        await popup.goto(`chrome-extension://${extensionId}/index.html`);
        await popup.waitForLoadState('domcontentloaded');

        // Wait for any initial animations to settle
        await popup.waitForTimeout(500);

        await expect(popup).toHaveScreenshot('popup-initial.png');
    });

    test('Chat UI State', async ({ page, extensionId }) => {
        const popup = await page.context().newPage();
        await popup.goto(`chrome-extension://${extensionId}/index.html`);
        await popup.waitForLoadState('domcontentloaded');

        const input = popup.locator('input[type="text"]');
        await input.fill('Hello Visual Test');

        // Don't submit, just check input state
        await expect(popup).toHaveScreenshot('popup-input-filled.png');
    });

    test('Error State Visuals', async ({ page, extensionId }) => {
        const popup = await page.context().newPage();
        await popup.goto(`chrome-extension://${extensionId}/index.html`);

        // Inject a fake error message if possible, or trigger one
        // Using evaluate to force an error state UI if we can't easily trigger it via props
        await popup.evaluate(() => {
            document.body.innerHTML += `
                <div style="position:fixed; top:0; left:0; right:0; background:red; color:white; padding:10px; z-index:9999;">
                    CRITICAL ERROR: VISUAL TEST
                </div>
            `;
        });

        await expect(popup).toHaveScreenshot('popup-error-state.png');
    });
});
