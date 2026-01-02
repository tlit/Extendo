
/// <reference types="vitest" />
// @vitest-environment jsdom

import { describe, it, expect } from 'vitest';
import { ContextHarvester } from '../../core/harvester';

describe('Performance Benchmarks', () => {

    it('should harvest complex DOM in under 50ms', () => {
        // Generate a massive DOM
        let html = '<div id="root">';
        for (let i = 0; i < 5000; i++) {
            html += `<div class="item-${i}"><span>Value ${i}</span></div>`;
        }
        html += '</div>';
        document.body.innerHTML = html;

        const start = performance.now();
        ContextHarvester.harvest();
        const end = performance.now();
        const duration = end - start;

        console.log(`Harvest Duration (5000 items): ${duration.toFixed(2)}ms`);
        expect(duration).toBeLessThan(50);
    });

    it('should remain performant with deeply nested structures', () => {
        let html = '<div id="nest-root">';
        let closeTags = '';
        for (let i = 0; i < 100; i++) {
            html += `<div id="d-${i}">`;
            closeTags = '</div>' + closeTags;
        }
        html += 'Content' + closeTags + '</div>';
        document.body.innerHTML = html;

        const start = performance.now();
        ContextHarvester.harvest();
        const end = performance.now();
        const duration = end - start;

        console.log(`Harvest Duration (Deep Nesting 100): ${duration.toFixed(2)}ms`);
        expect(duration).toBeLessThan(20);
    });

});
