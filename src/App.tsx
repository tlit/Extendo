import { useState } from 'react';
import { Library } from './popup/Library';
import { DebugConsole } from './popup/DebugConsole';
import { ChatInterface } from './components/ChatInterface';

function App() {
    const [view, setView] = useState<'chat' | 'library' | 'debug'>('chat');

    if (view === 'library') {
        return <Library onBack={() => setView('chat')} />;
    }

    if (view === 'debug') {
        return <DebugConsole onBack={() => setView('chat')} />;
    }

    return <ChatInterface onViewChange={setView} />;
}

export default App;
