export interface LogEntry {
    id: string;
    category: 'system' | 'ai' | 'execution' | 'error';
    message: string;
    data?: any;
    timestamp: number;
}

export class Logger {
    static async log(category: LogEntry['category'], message: string, data?: any) {
        const entry: LogEntry = {
            id: crypto.randomUUID(),
            category,
            message,
            data,
            timestamp: Date.now()
        };

        // Broadcast for realtime UI
        chrome.runtime.sendMessage({ action: "LOG_ENTRY", payload: entry }).catch(() => { }); // Ignore if no UI open

        // Persist (Circular buffer of last 50 logs - simplified for now, just append)
        // In real prod, we'd limit this.
        // const logs = await this.getLogs();
        // logs.push(entry);
        // await chrome.storage.local.set({ extension_logs: logs.slice(-50) });
    }

    static async getLogs(): Promise<LogEntry[]> {
        // For this MVP, we rely on realtime streaming mostly, but could fetch from storage
        return [];
    }
}
