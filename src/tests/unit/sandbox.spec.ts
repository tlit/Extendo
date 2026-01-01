import { expect, test } from '@playwright/test';
import { Sandbox } from '../../core/sandbox';

test('SandboxWrapper', () => {
    const rawCode = `console.log("Risk!")`;
    const wrapped = Sandbox.createExecutionContext(rawCode, { type: 'test' });

    // 1. Must contain try/catch
    expect(wrapped).toContain('try {');
    expect(wrapped).toContain('catch (error) {');

    // 2. Must report back
    expect(wrapped).toContain('chrome.runtime.sendMessage');
    expect(wrapped).toContain('EXECUTION_COMPLETE');

    // 3. Must contain the original code
    expect(wrapped).toContain(rawCode);

    // 4. Must NOT leak raw code outside try block (simple check)
    const codeIndex = wrapped.indexOf(rawCode);
    const tryIndex = wrapped.indexOf('try {');
    expect(codeIndex).toBeGreaterThan(tryIndex);
});
