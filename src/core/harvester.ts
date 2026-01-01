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
     * Creates a lightweight representation of the DOM using a TreeWalker.
     * Identifies structure and content while pruning noise.
     */
    private static summarizeDOM(): string {
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
            {
                acceptNode: (node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const el = node as HTMLElement;
                        const tag = el.tagName.toLowerCase();

                        // Ignore non-semantic/visual noise
                        if (['script', 'style', 'svg', 'path', 'noscript', 'iframe'].includes(tag)) {
                            return NodeFilter.FILTER_REJECT;
                        }

                        // Ignore hidden elements
                        if (el.style.display === 'none' || el.style.visibility === 'hidden' || el.hidden) {
                            return NodeFilter.FILTER_REJECT;
                        }

                        // Keep structural/content tags
                        return NodeFilter.FILTER_ACCEPT;
                    }

                    if (node.nodeType === Node.TEXT_NODE) {
                        const text = node.textContent?.trim();
                        // Filter empty text nodes
                        return text ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
                    }

                    return NodeFilter.FILTER_SKIP;
                }
            }
        );

        let output = '';
        const maxTokens = 6000; // Rough character limit estimate

        while (walker.nextNode()) {
            const node = walker.currentNode;

            if (output.length > maxTokens) {
                output += '\n... [TRUNCATED]';
                break;
            }

            if (node.nodeType === Node.ELEMENT_NODE) {
                const el = node as HTMLElement;
                const tag = el.tagName.toLowerCase();
                const id = el.id ? `#${el.id}` : '';
                const classes = el.classList.length ? `.${Array.from(el.classList).join('.')}` : '';

                // Indentation for structure
                // output += `\n${'  '.repeat(depth)}<${tag}${id}${classes}>`; 
                // Flattening slightly for token efficiency, just keeping tagging
                output += `<${tag}${id}${classes}>`;
            } else if (node.nodeType === Node.TEXT_NODE) {
                output += `${node.textContent?.trim()} `;
            }
        }

        return output;
    }
}
