import { motion, AnimatePresence } from 'framer-motion';
import { Send } from 'lucide-react';
import { Header } from './Header';
import { MessageBubble } from './MessageBubble';
import { useChat } from '../hooks/useChat';

interface ChatInterfaceProps {
    onViewChange: (view: 'library' | 'debug') => void;
}

export const ChatInterface = ({ onViewChange }: ChatInterfaceProps) => {
    const {
        messages,
        input,
        setInput,
        isProcessing,
        sendMessage,
        saveToLibrary,
        messagesEndRef
    } = useChat();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(input);
    };

    return (
        <div className="w-[400px] h-[600px] bg-slate-950 text-slate-100 flex flex-col overflow-hidden font-sans border-l border-slate-800">
            <Header isProcessing={isProcessing} onViewChange={onViewChange} />

            {/* Messages */}
            <main className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar">
                <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                        <MessageBubble key={msg.id} message={msg} onSave={saveToLibrary} />
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
};
