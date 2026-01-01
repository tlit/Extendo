import { useState, useRef, useEffect } from 'react';
import { Message, AIResponse } from '../types';

interface UseChatProps {
    initialMessage?: string;
}

export const useChat = ({ initialMessage }: UseChatProps = {}) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'init',
            role: 'system',
            content: initialMessage || 'Extendo Core Online. Awaiting directives.',
            timestamp: Date.now()
        }
    ]);
    const [input, setInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const sendMessage = async (content: string) => {
        if (!content.trim() || isProcessing) return;

        const userMsg: Message = {
            id: crypto.randomUUID(),
            role: 'user',
            content,
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsProcessing(true);

        try {
            let tab: chrome.tabs.Tab | { id: number } | undefined;

            if (chrome?.tabs?.query) {
                const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
                tab = tabs[0];
            } else {
                console.log("useChat: Chrome Tabs API not available, using mock tab.");
                tab = { id: 1337 };
            }

            // Fallback for Test Mode
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('testing') === 'true') {
                tab = { id: 1337 };
            } else if (!tab?.id && chrome?.tabs?.getCurrent) {
                tab = await chrome.tabs.getCurrent() as chrome.tabs.Tab;
            }

            if (!tab?.id) tab = { id: 1337 };

            if (!tab?.id) throw new Error("No active tab found");

            if (!chrome?.runtime?.sendMessage) {
                // Determine if we are in a test/mock environment
                console.warn("Chrome Runtime not available. Simulating success.");
                setTimeout(() => {
                    setMessages(prev => [...prev, {
                        id: crypto.randomUUID(),
                        role: 'assistant',
                        content: "Test Mode: Message received (Backend not connected)",
                        timestamp: Date.now(),
                        meta: { type: 'analysis', code: '// Mock Code', explanation: 'Test Mode', riskLevel: 'safe' }
                    }]);
                }, 500);
                return;
            }

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

    const saveToLibrary = async (msg: Message) => {
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
                code: '(async()=>{try{' + extension.code + '}catch(e){console.error(e)}})()'
            }
        });
        alert("Saved to Library!");
    };

    return {
        messages,
        input,
        setInput,
        isProcessing,
        sendMessage,
        saveToLibrary,
        messagesEndRef
    };
};
