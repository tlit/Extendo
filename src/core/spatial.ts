import { SpatialElement } from '../types';

export class SpatialHarvester {
    private static nextId = 0;

    /**
     * Scans the DOM for interactive elements and calculates their bounding boxes.
     */
    static getInteractiveElements(): SpatialElement[] {
        this.nextId = 0;
        const selector = 'button, a, input, select, textarea, [onclick], [role="button"], [role="link"]';
        const elements = Array.from(document.querySelectorAll(selector)) as HTMLElement[];

        const results: SpatialElement[] = [];

        elements.forEach(el => {
            const rect = el.getBoundingClientRect();

            // Skip invisible elements
            if (rect.width === 0 || rect.height === 0 || window.getComputedStyle(el).display === 'none') {
                return;
            }

            // Generate a temporary ID that the AI can use to reference this element
            // We store it on the element so subsequent "Click element 42" actions can work
            el.setAttribute('data-extendo-id', this.nextId.toString());

            results.push({
                id: this.nextId,
                rect: {
                    x: rect.x + window.scrollX, // Absolute coordinates
                    y: rect.y + window.scrollY,
                    width: rect.width,
                    height: rect.height,
                    top: rect.top + window.scrollY,
                    left: rect.left + window.scrollX,
                    bottom: rect.bottom + window.scrollY,
                    right: rect.right + window.scrollX
                },
                tagName: el.tagName.toLowerCase(),
                text: (el.textContent || (el as HTMLInputElement).value || '').slice(0, 50).trim(),
                isVisible: true
            });

            this.nextId++;
        });

        return results;
    }
}
