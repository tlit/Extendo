import { test, expect } from '../fixtures';
import fs from 'fs';


test('Set 4: Library & Sharing', async ({ page, extensionId }) => {
    await page.goto('https://example.com');
    const popupUrl = `chrome-extension://${extensionId}/index.html?testing=true`;
    const popup = await page.context().newPage();
    await popup.goto(popupUrl);

    // 1. Create & Save a Script
    await popup.getByPlaceholder('Describe change...').fill('TEST_SCENARIO:COLOR_RED');
    await popup.getByTestId('submit-btn').click();
    // 3. Verify Saved Item (Actually verifying Chat Response here)
    console.log('Verifying Chat Response...');
    await expect(popup.getByText(/Test Mode: Changing/).first()).toBeVisible();
    console.log('Chat Response Verified.');

    // Click "Save" button in the chat message
    await popup.getByRole('button', { name: 'Save' }).first().click();

    // 2. Export
    console.log('Exporting...');
    await popup.getByRole('button', { name: 'Library' }).click();
    const downloadPromise = popup.waitForEvent('download');
    await popup.getByTitle('Export JSON').click();
    const download = await downloadPromise;
    const filePath = await download.path();
    console.log('Exported.');

    // Verify file content
    console.log('Verifying Content...');
    const content = fs.readFileSync(filePath, 'utf8');
    expect(content).toContain('Test Mode: Changing background to red');
    console.log('Content Verified.');

    // 3. Delete
    console.log('Deleting...');
    await popup.getByRole('button', { name: 'Delete' }).click();
    console.log('Deleted.');

    // 4. Import
    console.log('Importing...');
    const fileInput = popup.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);
    console.log('Imported.');

    // 3. Verify Restore
    // Name truncates to 20 chars: "Test Mode: Changing ..." (Check prefix to be safe)
    console.log('Verifying Restore...');
    await expect(popup.getByText(/Test Mode: Changing/).first()).toBeVisible();
    console.log('Restore Verified.');
});
