import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Save } from 'lucide-react';
import { Message } from '../types';

interface MessageBubbleProps {
    message: Message;
    onSave: (msg: Message) => void;
}

export const MessageBubble = ({ message, onSave }: MessageBubbleProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.2 }}
            className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}
            data-testid="message-bubble"
        >
            <div
                className={`
                  max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm
                  ${message.role === 'user'
                        ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-none shadow-blue-900/20'
                        : message.role === 'system'
                            ? 'bg-red-500/10 text-red-200 border border-red-500/20 rounded-xl w-full flex items-center gap-2 font-mono text-xs'
                            : 'bg-slate-800 text-slate-200 rounded-bl-none border border-white/5'
                    }
            `}
            >
                {message.role === 'system' && <AlertCircle className="w-3 h-3 text-red-400 flex-shrink-0" />}
                {message.content}
            </div>

            {/* Metadata Chip */}
            {message.meta && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-1 flex items-center gap-1.5"
                >
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {message.meta.type.toUpperCase()}
                    </span>
                    {message.role === 'assistant' && (
                        <button
                            onClick={() => onSave(message)}
                            className="text-[10px] flex items-center gap-1 text-slate-500 hover:text-cyan-400 transition-colors"
                        >
                            <Save className="w-3 h-3" /> Save
                        </button>
                    )}
                </motion.div>
            )}
        </motion.div>
    );
};
