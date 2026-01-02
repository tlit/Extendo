
/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GeminiClient } from '../../services/GeminiClient';

describe('GeminiClient', () => {
    let client: GeminiClient;

    beforeEach(() => {
        client = new GeminiClient('TEST_API_KEY');
        global.fetch = vi.fn();
    });

    it('should return text content on success', async () => {
        const mockResponse = {
            candidates: [{
                content: { parts: [{ text: "Hello World" }] }
            }]
        };

        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => mockResponse
        });

        const result = await client.generateContent("Prompt");
        expect(result).toBe("Hello World");
    });

    it('should throw error on 429 Rate Limit', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: false,
            statusText: "Too Many Requests"
        });

        await expect(client.generateContent("Prompt")).rejects.toThrow("Too Many Requests");
    });

    it('should throw error on 500 Server Error', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: false,
            statusText: "Internal Server Error"
        });

        await expect(client.generateContent("Prompt")).rejects.toThrow("Internal Server Error");
    });

    it('should parse markdown JSON correctly', () => {
        const raw = '```json\n{"key": "value"}\n```';
        const parsed = GeminiClient.parseFnResponse(raw);
        expect(parsed).toEqual({ key: "value" });
    });
});
