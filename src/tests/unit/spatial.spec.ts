
/// <reference types="vitest" />


import { describe, it, expect } from 'vitest';
import { SpatialHarvester } from '../../core/spatial';

describe('SpatialHarvester', () => {
    it('should identify interactive elements', () => {
        document.body.innerHTML = `
            <div>
                <button id="btn">Click Me</button>
                <a href="#">Link</a>
                <input type="text" />
                <div>Not Interactive</div>
            </div>
        `;

        // Mock visibility for all elements
        Array.from(document.body.querySelectorAll('*')).forEach(el => {
            el.getBoundingClientRect = () => ({
                width: 100, height: 20, x: 0, y: 0,
                top: 0, left: 0, bottom: 20, right: 100,
                toJSON: () => { }
            } as any);
        });

        const elements = SpatialHarvester.getInteractiveElements();

        // Buttons, Links, Inputs should be captured
        expect(elements.some(el => el.tagName === 'button')).toBe(true);
        expect(elements.some(el => el.tagName === 'a')).toBe(true);
        expect(elements.some(el => el.tagName === 'input')).toBe(true);

        // Divs should generally be ignored unless they have roles
        expect(elements.some(el => el.tagName === 'div')).toBe(false);
    });

    it('should assign unique IDs', () => {
        document.body.innerHTML = `
            <button>1</button>
            <button>2</button>
        `;

        // Mock visibility
        Array.from(document.body.querySelectorAll('button')).forEach(el => {
            el.getBoundingClientRect = () => ({
                width: 100, height: 20, x: 0, y: 0,
                top: 0, left: 0, bottom: 20, right: 100,
                toJSON: () => { }
            } as any);
        });

        const elements = SpatialHarvester.getInteractiveElements();
        const ids = elements.map(e => e.id);
        const uniqueIds = new Set(ids);

        expect(ids.length).toBe(2);
        expect(uniqueIds.size).toBe(2);
    });

    it('should calculate absolute coordinates', () => {
        document.body.innerHTML = `<button id="target" style="position: absolute; top: 100px; left: 50px; width: 200px; height: 50px;">Target</button>`;
        const btn = document.getElementById('target')!;

        // Mock getBoundingClientRect
        btn.getBoundingClientRect = () => ({
            x: 50, y: 100, width: 200, height: 50,
            top: 100, left: 50, right: 250, bottom: 150,
            toJSON: () => { }
        });

        // Mock scroll
        Object.defineProperty(window, 'scrollX', { value: 0, writable: true });
        Object.defineProperty(window, 'scrollY', { value: 20, writable: true });

        const elements = SpatialHarvester.getInteractiveElements();
        const spatialBtn = elements[0];

        // Should add scroll offset
        expect(spatialBtn.rect.y).toBe(120); // 100 + 20
        expect(spatialBtn.rect.x).toBe(50);  // 50 + 0
    });
});
