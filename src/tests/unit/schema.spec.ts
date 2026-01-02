/// <reference types="vitest" />
import { describe, it, expect } from 'vitest';
import { validateAIResponse } from '../../core/schema';

describe('Schema Validation', () => {
    it('should validate correct AI response', () => {
        const valid = {
            type: 'style',
            code: 'console.log("ok")',
            explanation: 'Just testing',
            riskLevel: 'safe'
        };
        const result = validateAIResponse(valid);
        expect(result).toEqual(valid);
    });

    it('should throw on missing fields', () => {
        const invalid = {
            type: 'style',
            // Code missing
            explanation: 'Broken'
        };
        expect(() => validateAIResponse(invalid)).toThrow();
    });

    it('should throw on invalid enum values', () => {
        const invalid = {
            type: 'super_hacker_mode', // Invalid type
            code: '...',
            explanation: '...',
            riskLevel: 'safe'
        };
        expect(() => validateAIResponse(invalid)).toThrow();
    });
});
