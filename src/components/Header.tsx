import { Sparkles, Code, Terminal } from 'lucide-react';

interface HeaderProps {
    isProcessing: boolean;
    onViewChange: (view: 'library' | 'debug') => void;
}

export const Header = ({ isProcessing, onViewChange }: HeaderProps) => {
    return (
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
                <button
                    onClick={() => onViewChange('library')}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white"
                    title="Library"
                >
                    <Code className="w-4 h-4" />
                </button>
                <button
                    onClick={() => onViewChange('debug')}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white"
                    title="Debug Console"
                >
                    <Terminal className="w-4 h-4" />
                </button>
            </div>
        </header>
    );
};
