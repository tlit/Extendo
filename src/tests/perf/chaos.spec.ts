/// <reference types="vitest" />


import { describe, it, expect } from 'vitest';
import { ContextHarvester } from '../../core/harvester';

describe('Chaos & Stress Testing', () => {

    it('should survive active DOM mutations during harvesting', async () => {
        // Setup initial DOM
        document.body.innerHTML = '<div id="chaos-root"></div>';
        const root = document.getElementById('chaos-root')!;

        let isRunning = true;

        // Chaos Monkey: randomly add/remove nodes
        const chaosInterval = setInterval(() => {
            if (!isRunning) return;

            const action = Math.random() > 0.5 ? 'add' : 'remove';
            if (action === 'add') {
                const div = document.createElement('div');
                div.textContent = `Node ${Date.now()}`;
                root.appendChild(div);
            } else {
                if (root.lastChild) {
                    root.removeChild(root.lastChild);
                }
            }
        }, 10); // Very fast mutations

        // Start Harvester multiple times while chaos is running
        try {
            for (let i = 0; i < 5; i++) {
                const start = performance.now();
                const result = ContextHarvester.harvest();
                const end = performance.now();

                expect(result).toBeDefined();
                expect(end - start).toBeLessThan(100); // Should still be fast

                // Wait a bit between harvests
                await new Promise(r => setTimeout(r, 50));
            }
        } finally {
            isRunning = false;
            clearInterval(chaosInterval);
        }
    });

    it('should handle massive depth without stack overflow', () => {
        // Create a ridiculously deep tree
        let current: HTMLElement = document.body;
        const depth = 2000; // Deep enough to challenge recursion limits if not careful

        for (let i = 0; i < depth; i++) {
            const div = document.createElement('div');
            div.id = `depth-${i}`;
            current.appendChild(div);
            current = div;
        }

        const result = ContextHarvester.harvest();
        expect(result.domSummary.length).toBeGreaterThan(0);
        // Clean up
        document.body.innerHTML = '';
    });
});
