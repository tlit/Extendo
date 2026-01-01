import { useState, useEffect, useRef } from 'react';
import { LogEntry } from '../core/logger';
import { Terminal, Ban } from 'lucide-react';

interface DebugConsoleProps {
    onBack: () => void;
}

export function DebugConsole({ onBack }: DebugConsoleProps) {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const listener = (req: any) => {
            if (req.action === "LOG_ENTRY") {
                setLogs(prev => [...prev, req.payload]);
            }
        };

        if (chrome?.runtime?.onMessage) {
            chrome.runtime.onMessage.addListener(listener);
            return () => chrome.runtime.onMessage.removeListener(listener);
        } else {
            // Mock logs for testing
            const timer = setTimeout(() => {
                setLogs([{ id: 'mock-log', timestamp: Date.now(), category: 'system', message: 'Test Environment detected. Console ready.' }]);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    return (
        <div className="flex flex-col h-full bg-[#0d1117] text-slate-300 font-mono text-xs">
            <header className="p-3 bg-slate-900 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-500">
                    <Terminal className="w-3 h-3" />
                    <span className="font-bold tracking-wider">DEBUG_MODE</span>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setLogs([])} className="hover:text-white" title="Clear">
                        <Ban className="w-3 h-3" />
                    </button>
                    <button onClick={onBack} className="text-cyan-400 hover:underline">Close</button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-2 space-y-1">
                {logs.length === 0 && <div className="text-slate-600 italic p-2">Waiting for extension activity...</div>}
                {logs.map(log => (
                    <div key={log.id} className="flex gap-2 break-all hover:bg-white/5 p-1 rounded">
                        <span className="text-slate-500 flex-shrink-0">[{new Date(log.timestamp).toLocaleTimeString().split(' ')[0]}]</span>
                        <span className={`flex-shrink-0 font-bold w-16 uppercase ${log.category === 'error' ? 'text-red-400' :
                            log.category === 'ai' ? 'text-purple-400' :
                                log.category === 'execution' ? 'text-emerald-400' : 'text-blue-400'
                            }`}>{log.category}</span>
                        <span className="text-slate-300">{log.message}</span>
                    </div>
                ))}
                <div ref={bottomRef} />
            </main>
        </div>
    );
}
