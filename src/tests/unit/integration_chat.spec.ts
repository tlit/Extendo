
/// <reference types="vitest" />
// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useChat } from '../../hooks/useChat';
import { ExtensionBridge } from '../../services/ExtensionBridge';

// Mock ExtensionBridge
vi.mock('../../services/ExtensionBridge', () => ({
    ExtensionBridge: {
        getActiveTabId: vi.fn(),
        executePrompt: vi.fn(),
        saveScript: vi.fn()
    }
}));

describe('useChat Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should initialize with system message', () => {
        const { result } = renderHook(() => useChat());
        expect(result.current.messages[0].role).toBe('system');
        expect(result.current.messages[0].content).toContain('Extendo Core Online');
    });

    it('should send user message and handle response', async () => {
        const { result } = renderHook(() => useChat());

        // Mock success response
        (ExtensionBridge.getActiveTabId as any).mockResolvedValue(123);
        (ExtensionBridge.executePrompt as any).mockResolvedValue({
            explanation: 'Action Complete',
            type: 'interaction',
            code: 'console.log("test")',
            riskLevel: 'safe'
        });

        await act(async () => {
            await result.current.sendMessage('Hello AI');
        });

        // Verify state updates
        expect(result.current.messages).toHaveLength(3); // System, User, Assistant
        expect(result.current.messages[1].content).toBe('Hello AI');
        expect(result.current.messages[2].content).toBe('Action Complete');
        expect(result.current.isProcessing).toBe(false);
    });

    it('should handle errors gracefully', async () => {
        const { result } = renderHook(() => useChat());

        (ExtensionBridge.getActiveTabId as any).mockResolvedValue(123);
        (ExtensionBridge.executePrompt as any).mockRejectedValue(new Error('Extension Error'));

        await act(async () => {
            await result.current.sendMessage('Fail me');
        });

        expect(result.current.messages).toHaveLength(3); // System, User, Error
        expect(result.current.messages[2].content).toContain('Error: Extension Error');
        expect(result.current.isProcessing).toBe(false);
    });
});
