
import { z } from 'zod';

export const AIResponseSchema = z.object({
    type: z.enum(['style', 'scrape', 'interaction', 'analysis']),
    code: z.string(),
    explanation: z.string(),
    riskLevel: z.enum(['safe', 'moderate', 'high'])
});

export type AIResponse = z.infer<typeof AIResponseSchema>;

export const validateAIResponse = (data: unknown): AIResponse => {
    return AIResponseSchema.parse(data);
};
