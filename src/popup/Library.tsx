import { motion } from 'framer-motion';
import { MicroExtension } from '../types';
import { Trash2, Play, Power, Download, Upload } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface LibraryProps {
    onBack: () => void;
}

export function Library({ onBack }: LibraryProps) {
    const [extensions, setExtensions] = useState<MicroExtension[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        refreshList();
    }, []);

    const refreshList = () => {
        if (!chrome?.runtime?.sendMessage) {
            console.log("Library: Test Mode - using mock data");
            setExtensions([
                { id: 'mock-1', name: 'Test Script', trigger: 'test', code: 'console.log("test")', created: Date.now(), type: 'interaction', autoRun: false }
            ]);
            return;
        }
        chrome.runtime.sendMessage({ action: "GET_SCRIPTS" }).then(res => {
            if (res.data) setExtensions(res.data);
        });
    };

    const handleDelete = (id: string) => {
        if (!chrome?.runtime?.sendMessage) {
            setExtensions(prev => prev.filter(e => e.id !== id));
            return;
        }
        chrome.runtime.sendMessage({ action: "DELETE_SCRIPT", id }).then(() => {
            setExtensions(prev => prev.filter(e => e.id !== id));
        });
    };

    const handleToggle = (id: string) => {
        if (!chrome?.runtime?.sendMessage) {
            setExtensions(prev => prev.map(e => e.id === id ? { ...e, autoRun: !e.autoRun } : e));
            return;
        }
        chrome.runtime.sendMessage({ action: "TOGGLE_AUTORUN", id }).then(() => {
            setExtensions(prev => prev.map(e => e.id === id ? { ...e, autoRun: !e.autoRun } : e));
        });
    };

    const handleRun = async (code: string) => {
        if (!chrome?.tabs?.query) {
            console.log("Executing code in mock env:", code);
            return;
        }
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab?.id) {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: (c) => { window.eval(c) },
                args: [code],
                world: 'ISOLATED'
            });
        }
    };

    const handleExport = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(extensions));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "extendo-library.json");
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const json = JSON.parse(e.target?.result as string);
                if (!Array.isArray(json)) throw new Error("Invalid format: Expected array");

                let count = 0;
                for (const item of json) {
                    if (item.code && item.trigger) {
                        // Generate a new ID to avoid collisions
                        const newItem = { ...item, id: crypto.randomUUID() };
                        if (chrome?.runtime?.sendMessage) {
                            await chrome.runtime.sendMessage({ action: "SAVE_SCRIPT", payload: newItem });
                        }
                        count++;
                    }
                }
                alert(`Imported ${count} extensions!`);
                refreshList();
            } catch (err) {
                alert("Failed to import: " + err);
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="flex flex-col h-full bg-slate-950 text-slate-100">
            <header className="p-4 bg-slate-900/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h2 className="font-bold text-sm tracking-wide">LIBRARY</h2>
                    <div className="flex gap-1">
                        <button onClick={handleExport} className="p-1.5 hover:bg-white/5 rounded text-slate-400 hover:text-white" title="Export JSON">
                            <Download className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => fileInputRef.current?.click()} className="p-1.5 hover:bg-white/5 rounded text-slate-400 hover:text-white" title="Import JSON">
                            <Upload className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
                <button onClick={onBack} className="text-xs text-cyan-400 hover:underline">Back to Chat</button>
            </header>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleImport}
                accept=".json"
                className="hidden"
            />

            <main className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar">
                {extensions.length === 0 && (
                    <div className="text-center text-slate-500 text-sm mt-10">
                        No saved extensions.<br />Generate something to save it!
                    </div>
                )}
                {extensions.map(ext => (
                    <motion.div
                        key={ext.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-900/50 border border-white/5 rounded-xl p-3 flex flex-col gap-2"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-medium text-sm text-slate-200">{ext.name}</h3>
                                <p className="text-[10px] text-slate-500 truncate w-40">{ext.trigger}</p>
                            </div>
                            <div className="flex items-center gap-1">
                                <button onClick={() => handleRun(ext.code)} aria-label="Run" className="p-1.5 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors">
                                    <Play className="w-3 h-3" />
                                </button>
                                <button onClick={() => handleToggle(ext.id)} aria-label="Toggle" className={`p-1.5 rounded-lg transition-colors ${ext.autoRun ? 'text-amber-400 bg-amber-500/10' : 'text-slate-600 hover:text-slate-400'}`}>
                                    <Power className="w-3 h-3" />
                                </button>
                                <button onClick={() => handleDelete(ext.id)} aria-label="Delete" className="p-1.5 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors">
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                        </div>

                        <div className="mt-1 flex gap-2">
                            <span className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 uppercase tracking-wider">{ext.type}</span>
                        </div>
                    </motion.div>
                ))}
            </main>
        </div>
    );
}
