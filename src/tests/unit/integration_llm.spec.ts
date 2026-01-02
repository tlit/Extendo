
/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LLMService } from '../../services/llm.ts';
import { GeminiClient } from '../../services/GeminiClient';

// Mock GeminiClient to check Prompt Construction
vi.mock('../../services/GeminiClient', () => {
    return {
        GeminiClient: class {
            constructor(public apiKey: string) { }
            // Static mock function we can inspect
            async generateContent(prompt: string) {
                // @ts-ignore
                return this.generateContentMock(prompt);
            }
            // @ts-ignore
            generateContentMock = vi.fn().mockResolvedValue('```json\n{"code": "x=1"}\n```');
            static parseFnResponse(text: string) { return JSON.parse(text); }
        }
    };
});

describe('LLMService Prompt Integration', () => {
    it('should construct system prompt correctly', async () => {
        const service = new LLMService('TEST_KEY');
        const client = (service as any).client;

        // Spy on the mock method attached to the instance
        client.generateContentMock = vi.fn().mockResolvedValue('{"code": "console.log(1)", "explanation": "test", "type": "style", "riskLevel": "safe"}');

        await service.generateCode({
            prompt: 'Make background red',
            context: {
                url: 'http://test.com',
                title: 'Test',
                domSummary: '<div>Summary</div>',
                timestamp: 123
            }
        });

        const callArgs = client.generateContentMock.mock.calls[0][0];

        expect(callArgs).toContain('You are Extendo');
        expect(callArgs).toContain('Make background red');
        expect(callArgs).toContain('<div>Summary</div>');
        expect(callArgs).toContain('Spatial Awareness');
    });
});
