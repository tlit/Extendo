import { test, expect } from '../fixtures';

test.describe('Fuzzing & Adversarial Inputs', () => {

    // Mini BLNS (Big List of Naughty Strings)
    const naughtyStrings = [
        '<script>alert(1)</script>',         // XSS
        'Powerلُلُصّبُلُلصّبُررً ॣ ॣh ॣ ॣ冗',   // Unicode crashes
        'CON',                                // Windows reserved filenames
        'nul',                                // Windows reserved filenames
        'undefined',
        'null',
        'NaN',
        'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', // Overflow
        'v/*\\/default/login/../../../../../../../../../../../../../../etc/passwd', // Path traversal
        '{{7*7}}',                            // Template injection
    ];

    for (const nasty of naughtyStrings) {
        test(`should survive input: ${nasty.substring(0, 20)}...`, async ({ page, extensionId }) => {
            const popup = await page.context().newPage();
            await popup.goto(`chrome-extension://${extensionId}/index.html`);

            const input = popup.locator('input[type="text"]');

            // 1. Fill with nasty string
            await input.fill(nasty);

            // 2. Submit
            await input.press('Enter');

            // 3. Check for crash (blank page or disconnected context)
            // If the extension crashes, the page might close or body becomes empty
            const body = popup.locator('body');
            await expect(body).toBeVisible();

            // 4. Verify we are effectively still alive (input is still there or cleared, but UI exists)
            // We don't necessarily expect a "success" response, just NOT a crash.
            const messages = popup.locator('[data-testid="message-bubble"]');
            // Eventually some message (even error) should appear or at least UI stays intact
            // Just verifying the input field is still actionable is a good liveness check
            await expect(input).toBeEditable();
        });
    }
});
