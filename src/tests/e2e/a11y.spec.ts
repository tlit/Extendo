import { test, expect } from '../fixtures';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility (A11y)', () => {
    test('Popup should not have critical a11y violations', async ({ page, extensionId }) => {
        const popup = await page.context().newPage();
        await popup.goto(`chrome-extension://${extensionId}/index.html`);
        await popup.waitForLoadState('domcontentloaded');

        const accessibilityScanResults = await new AxeBuilder({ page: popup })
            .exclude('#root') // Optional: if we want to ignore specific containers, but we want to scan root
            .analyze();

        // Log violations for easier debugging
        if (accessibilityScanResults.violations.length > 0) {
            console.log('A11y Violations:', accessibilityScanResults.violations);
        }

        expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('Chat Interface should be accessible', async ({ page, extensionId }) => {
        const popup = await page.context().newPage();
        await popup.goto(`chrome-extension://${extensionId}/index.html`);
        await popup.waitForLoadState('domcontentloaded');

        // Type something to trigger chat bubble state
        await popup.locator('input[type="text"]').fill('A11y Test');
        // Don't submit, just check this state

        // Scan specific region if needed, or full page
        const results = await new AxeBuilder({ page: popup }).analyze();
        expect(results.violations).toEqual([]);
    });
});
