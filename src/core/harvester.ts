import { SpatialHarvester } from './spatial';
import { PageContext } from '../types';

export class ContextHarvester {
    /**
     * Captures the current state of the page.
     * Use this sparingly as it serializes DOM.
     */
    static harvest(): PageContext {
        return {
            url: window.location.href,
            title: document.title,
            domSummary: this.summarizeDOM(),
            selection: window.getSelection()?.toString() || undefined,
            timestamp: Date.now(),
            interactiveElements: SpatialHarvester.getInteractiveElements()
        };
    }

    /**
     * Creates a lightweight representation of the DOM.
     * Truncates heavily to stay within token limits.
     */
    private static summarizeDOM(): string {
        const bodyClone = document.body.cloneNode(true) as HTMLElement;

        // Remove scripts, styles, and SVGs to save space
        const removables = bodyClone.querySelectorAll('script, style, svg, path, noscript');
        removables.forEach(el => el.remove());

        // Simple text content + standard tags
        // TODO: Implement a better tree-walker that keeps IDs and Classes relevant for selectors
        let html = bodyClone.innerHTML;

        // Naive truncation
        if (html.length > 20000) {
            html = html.substring(0, 20000) + "... [TRUNCATED]";
        }

        return html;
    }
}
