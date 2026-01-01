import { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { ExtensionBridge } from '../services/ExtensionBridge';

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
            const tabId = await ExtensionBridge.getActiveTabId();
            const aiData = await ExtensionBridge.executePrompt(userMsg.content, tabId);

            setMessages(prev => [...prev, {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: aiData.explanation || "Action executed.",
                timestamp: Date.now(),
                meta: aiData
            }]);

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
