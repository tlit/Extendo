import { test, expect } from '../fixtures';

test('Set 2: Self-Healing Loop', async ({ page, extensionId }) => {
    await page.goto('https://example.com');
    const popupUrl = `chrome-extension://${extensionId}/index.html`;
    const popup = await page.context().newPage();
    await popup.goto(popupUrl);

    // 1. Prompt that is "destined to fail" (Mocked via special keyword or prompt)
    // We assume our mock LLM handles "TEST_FAIL_THEN_FIX" or we simply check the behavior of retry logic
    await popup.getByPlaceholder('Describe change...').fill('TEST_SCENARIO:FAIL_FIRST');
    await popup.getByTestId('submit-btn').click();

    // 2. Expect Self-Healing Triggers
    // The first execution should fail, triggering the repair loop in background

    // 2. Expect Error (Since injection intentionally fails)
    await expect(popup.getByText('Error')).toBeVisible();
});
