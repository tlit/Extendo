
import { AIResponse } from '../types';

export class ExtensionBridge {
    static async getActiveTabId(): Promise<number> {
        // Mock / Test Mode Check
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('testing') === 'true') return 1337;

        if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tabs[0]?.id) return tabs[0].id;
        }

        if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.getCurrent) {
            const tab = await chrome.tabs.getCurrent();
            if (tab?.id) return tab.id;
        }

        // Fallback or Dev Mode
        return 1337;
    }

    static async executePrompt(prompt: string, tabId: number): Promise<AIResponse> {
        if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.sendMessage) {
            // Simulate delay and mock response for UI testing
            await new Promise(r => setTimeout(r, 500));
            return {
                type: 'analysis',
                code: '// Mock Code',
                explanation: 'Test Mode: Message received (Backend not connected)',
                riskLevel: 'safe'
            };
        }

        const response = await chrome.runtime.sendMessage({
            action: "EXECUTE_PROMPT",
            prompt,
            tabId
        });

        if (response && response.status === 'success') {
            return response.data as AIResponse;
        }
        throw new Error(response?.message || "Unknown extension error");
    }

    static async saveScript(extension: any): Promise<void> {
        // Wrap code in IFFE for strict safety in library
        const safePayload = {
            ...extension,
            code: '(async()=>{try{' + extension.code + '}catch(e){console.error(e)}})()'
        };

        if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.sendMessage) {
            console.log("Mock Save:", safePayload);
            return;
        }

        await chrome.runtime.sendMessage({
            action: "SAVE_SCRIPT",
            payload: safePayload
        });
    }
}
