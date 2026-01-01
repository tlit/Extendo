
/// <reference types="vitest" />
// @vitest-environment jsdom

import { describe, it, expect } from 'vitest';
import { ContextHarvester } from '../../core/harvester';

describe('ContextHarvester', () => {
    it('should ignore non-semantic tags (script, style)', () => {
        document.body.innerHTML = `
            <div id="main">
                <h1>Title</h1>
                <script>const x = 1;</script>
                <style>.red { color: red; }</style>
                <p>Content</p>
            </div>
        `;

        const result = ContextHarvester.harvest();
        const summary = result.domSummary;

        expect(summary).toContain('<h1>');
        expect(summary).toContain('Content');
        expect(summary).not.toContain('<script>');
        expect(summary).not.toContain('const x = 1');
        expect(summary).not.toContain('<style>');
    });

    it('should filter hidden elements', () => {
        document.body.innerHTML = `
            <div>
                <span style="display: none">Hidden 1</span>
                <div hidden>Hidden 2</div>
                <p style="visibility: hidden">Hidden 3</p>
                <span>Visible</span>
            </div>
        `;

        const result = ContextHarvester.harvest();
        const summary = result.domSummary;

        expect(summary).toContain('Visible');
        expect(summary).not.toContain('Hidden 1');
    });

    it('should structure output with IDs and Classes', () => {
        document.body.innerHTML = `
            <div id="container" class="flex row">
                <button class="btn-primary">Click</button>
            </div>
        `;

        const result = ContextHarvester.harvest();
        const summary = result.domSummary;

        expect(summary).toContain('<div#container.flex.row>');
        expect(summary).not.toContain('class="flex row"'); // It should convert to .flex.row
        expect(summary).toContain('<button.btn-primary>');
    });

    it('should respect token limits (truncation)', () => {
        const longText = 'a'.repeat(100);
        let html = '';
        for (let i = 0; i < 100; i++) {
            html += `<p>${longText}</p>`;
        }
        document.body.innerHTML = html;

        const result = ContextHarvester.harvest();
        const summary = result.domSummary;

        expect(summary.length).toBeGreaterThan(0);
        expect(summary.length).toBeLessThan(10000);
    });
});
