import { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { ExtensionBridge } from '../services/ExtensionBridge';

interface UseChatProps {
    initialMessage?: string;
}

export const useChat = ({ initialMessage }: UseChatProps = {}) => {
    const generateId = () => {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    };

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
        if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === 'function') {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    useEffect(scrollToBottom, [messages]);

    useEffect(() => {
        const listener = (request: any) => {
            if (request.action === "RUNTIME_UPDATE") {
                if (request.status === 'error') {
                    setMessages(prev => [...prev, {
                        id: generateId(),
                        role: 'system',
                        content: `Runtime Error: ${request.error}`,
                        timestamp: Date.now()
                    }]);
                } else if (request.status === 'success') {
                    // Optional: Add success confirmation if desired, or stay silent
                }
            }
        };
        // Mock environment check
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
            chrome.runtime.onMessage.addListener(listener);
            return () => chrome.runtime.onMessage.removeListener(listener);
        }
    }, []);

    const sendMessage = async (content: string) => {
        if (!content.trim() || isProcessing) return;

        const userMsg: Message = {
            id: generateId(),
            role: 'user',
            content,
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsProcessing(true);

        try {
            const tabId = await ExtensionBridge.getActiveTabId();
            const aiData = await ExtensionBridge.executePrompt(userMsg.content, tabId);

            setMessages(prev => [...prev, {
                id: generateId(),
                role: 'assistant',
                content: aiData.explanation || "Action executed.",
                timestamp: Date.now(),
                meta: aiData
            }]);

        } catch (error: any) {
            setMessages(prev => [...prev, {
                id: generateId(),
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
            id: generateId(),
            name: msg.content.substring(0, 20) + '...',
            trigger: msg.content,
            code: msg.meta.code,
            created: Date.now(),
            type: msg.meta.type,
            autoRun: false
        };

        await ExtensionBridge.saveScript(extension);
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

