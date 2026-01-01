import { test, expect } from '../fixtures';

test('Set 2: Self-Healing Loop', async ({ page, extensionId }) => {
    await page.goto('https://example.com');
    const popupUrl = `chrome-extension://${extensionId}/index.html?testing=true`;
    const popup = await page.context().newPage();
    await popup.goto(popupUrl);

    // 1. Prompt that is "destined to fail" (Mocked via special keyword or prompt)
    // We assume our mock LLM handles "TEST_FAIL_THEN_FIX" or we simply check the behavior of retry logic
    await popup.getByPlaceholder('Describe change...').fill('TEST_SCENARIO:FAIL_FIRST');
    await popup.getByTestId('submit-btn').click();

    // 2. Expect Self-Healing Triggers
    // The first execution should fail, triggering the repair loop in background

    // 2. Expect Success (Simulated by Test Mode logic in background)
    // Note: Real healing loop happens in background, checking initial injection success here
    await expect(popup.getByText('Test Mode: Generating broken code')).toBeVisible();
});
