import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Terminal, AlertCircle, CheckCircle2, Code, Save } from 'lucide-react';
import { AIResponse } from './types';
import { Library } from './popup/Library';
import { DebugConsole } from './popup/DebugConsole';

interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
    meta?: AIResponse;
}

function App() {
    const [view, setView] = useState<'chat' | 'library' | 'debug'>('chat');
    const [input, setInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'init',
            role: 'system',
            content: 'Extendo Core Online. Awaiting directives.',
            timestamp: Date.now()
        }
    ]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isProcessing) return;

        const userMsg: Message = {
            id: crypto.randomUUID(),
            role: 'user',
            content: input,
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsProcessing(true);

        try {
            let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            // Fallback for Test Mode (Popup opening as a Tab)
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('testing') === 'true') {
                console.log("App: Test Mode Detected. Using Mock Tab ID.");
                // Create a fake tab object
                tab = { id: 1337, active: true, windowId: 1, index: 0, highlighted: false, incognito: false, selected: true, pinned: false } as chrome.tabs.Tab;
            } else if (!tab?.id) {
                tab = await chrome.tabs.getCurrent() as chrome.tabs.Tab;
            }
            console.log("App: Resolved Tab:", tab);

            if (!tab?.id) throw new Error("No active tab found");

            const response = await chrome.runtime.sendMessage({
                action: "EXECUTE_PROMPT",
                prompt: userMsg.content,
                tabId: tab.id
            });

            if (response && response.status === 'success') {
                const aiData = response.data as AIResponse;
                setMessages(prev => [...prev, {
                    id: crypto.randomUUID(),
                    role: 'assistant',
                    content: aiData.explanation || "Action executed.",
                    timestamp: Date.now(),
                    meta: aiData
                }]);
            } else {
                throw new Error(response?.message || "Unknown error");
            }

        } catch (error: any) {
            setMessages(prev => [...prev, {
                id: crypto.randomUUID(),
                role: 'system',
                content: `Error: ${error.message}`,
                timestamp: Date.now()
            }]);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSave = async (msg: Message) => {
        if (!msg.meta) return;
        const extension = {
            id: crypto.randomUUID(),
            name: msg.content.substring(0, 20) + '...',
            trigger: msg.content,
            code: msg.meta.code,
            created: Date.now(),
            type: msg.meta.type,
            autoRun: false
        };

        await chrome.runtime.sendMessage({
            action: "SAVE_SCRIPT",
            payload: {
                ...extension,
                // Using string concatenation to avoid template literal escaping hell
                code: '(async()=>{try{' + extension.code + '}catch(e){console.error(e)}})()'
            }
        });
        alert("Saved to Library!");
    };

    if (view === 'library') {
        return <Library onBack={() => setView('chat')} />;
    }

    if (view === 'debug') {
        return <DebugConsole onBack={() => setView('chat')} />;
    }

    return (
        <div className="w-[400px] h-[600px] bg-slate-950 text-slate-100 flex flex-col overflow-hidden font-sans border-l border-slate-800">
            {/* Header */}
            <header className="p-4 bg-slate-900/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        {isProcessing && <div className="absolute inset-0 rounded-full animate-ping bg-cyan-400 opacity-20" />}
                    </div>
                    <div>
                        <h1 className="font-bold text-sm tracking-wide text-white">EXTENDO</h1>
                        <div className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${isProcessing ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                                {isProcessing ? 'Processing' : 'Active'}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-1">
                    <button onClick={() => setView('library')} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white" title="Library">
                        <Code className="w-4 h-4" />
                    </button>
                    <button onClick={() => setView('debug')} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white" title="Debug Console">
                        <Terminal className="w-4 h-4" />
                    </button>
                </div>
            </header>

            {/* Messages */}
            <main className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar">
                <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.2 }}
                            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                        >
                            <div
                                className={`
                  max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm
                  ${msg.role === 'user'
                                        ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-none shadow-blue-900/20'
                                        : msg.role === 'system'
                                            ? 'bg-red-500/10 text-red-200 border border-red-500/20 rounded-xl w-full flex items-center gap-2 font-mono text-xs'
                                            : 'bg-slate-800 text-slate-200 rounded-bl-none border border-white/5'
                                    }
            `}
                            >
                                {msg.role === 'system' && <AlertCircle className="w-3 h-3 text-red-400 flex-shrink-0" />}
                                {msg.content}
                            </div>

                            {/* Metadata Chip */}
                            {msg.meta && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="mt-1 flex items-center gap-1.5"
                                >
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" />
                                        {msg.meta.type.toUpperCase()}
                                    </span>
                                    {msg.role === 'assistant' && (
                                        <button onClick={() => handleSave(msg)} className="text-[10px] flex items-center gap-1 text-slate-500 hover:text-cyan-400 transition-colors">
                                            <Save className="w-3 h-3" /> Save
                                        </button>
                                    )}
                                </motion.div>
                            )}
                        </motion.div>
                    ))}
                    {isProcessing && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-start"
                        >
                            <div className="bg-slate-800/50 px-4 py-3 rounded-2xl rounded-bl-none border border-white/5 flex gap-1">
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </main>

            {/* Input */}
            <footer className="p-4 bg-slate-900 border-t border-white/5">
                <form onSubmit={handleSubmit} className="relative group">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isProcessing}
                        autoFocus
                        placeholder="Describe change..."
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all placeholder:text-slate-600"
                    />
                    <button
                        type="submit"
                        aria-label="Submit"
                        data-testid="submit-btn"
                        disabled={!input.trim() || isProcessing}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            </footer>
        </div>
    );
}

export default App;
