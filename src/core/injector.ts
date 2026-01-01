import { Sandbox } from './sandbox';

export class ScriptInjector {
    /**
     * Executes code in the specified tab.
     * @param tabId The tab to inject into.
     * @param code The raw JavaScript code.
     */
    static async execute(tabId: number, code: string) {
        // We pass 'execution' as the type for generic injection
        const safeCode = Sandbox.createExecutionContext(code, { type: 'execution' });

        try {
            await chrome.scripting.executeScript({
                target: { tabId },
                // injecting as a function is safer/cleaner, but we are executing dynamic strings from AI.
                // We use 'func' with an eval wrapper to keep context clean.
                func: (injectedCode) => {
                    // eslint-disable-next-line no-eval
                    window.eval(injectedCode);
                },
                args: [safeCode],
                // MAIN world allows access to window variables (useful for scraping single-page apps)
                // ISOLATED world is safer for extension logic. 
                // For 'Interaction', MAIN is often better. For 'Style', ISOLATED is fine.
                // Let's default to ISOLATED for now, but upgradable.
                world: 'ISOLATED'
            });
            return { status: 'injected' };
        } catch (error: any) {
            console.error("Injection Failed:", error);
            return { status: 'error', message: error.message };
        }
    }
}
