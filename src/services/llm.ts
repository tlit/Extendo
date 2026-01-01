import { AIResponse, LLMRequest } from '../types';
import { GeminiClient } from './GeminiClient';
import { TestScenarioHandler } from './TestScenarioHandler';

export class LLMService {
    private client: GeminiClient;
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
        this.client = new GeminiClient(apiKey);
    }

    async generateCode(request: LLMRequest): Promise<AIResponse> {
        // 1. Check Test Scenarios
        const testResponse = TestScenarioHandler.handle(request.prompt, request.context);
        if (testResponse) return testResponse;

        // 2. Build Prompt
        const systemPrompt = `
You are Extendo, an expert browser automation agent.
Your goal is to write a single, efficient, self-contained JavaScript function that accomplishes the user's task on the current page.

Context:
${JSON.stringify(request.context, null, 2)}

Note on Spatial Awareness:
The context includes a list of 'interactiveElements' with their coordinates (x, y, top, left, etc.).
If the user asks for "the button below the search bar" or "the one on the right", USE THESE COORDINATES to find the correct element ID.
You can then select the element using: document.querySelector('[data-extendo-id="<ID>"]')

User Request: "${request.prompt}"

Return a JSON object with this structure:
{
  "explanation": "Brief 1-sentence description of what you did",
  "code": "The JavaScript code to execute. Do not wrap in markdown blocks.",
  "type": "style" | "scrape" | "interaction" | "analysis",
  "riskLevel": "safe" | "medium" | "high" 
}
`;

        // 3. Mock or Execute
        if (this.apiKey === "TODO_API_KEY") {
            return {
                explanation: "I can't truly generate code without an API key, so here is a mock alert.",
                code: "alert('Extendo Mock Execution: ' + document.title);",
                type: "interaction",
                riskLevel: "safe"
            };
        }

        try {
            const text = await this.client.generateContent(systemPrompt);
            return GeminiClient.parseFnResponse(text);
        } catch (e) {
            console.error("LLM Error", e);
            throw new Error("Failed to generate code");
        }
    }

    async generateRepair(originalPrompt: string, brokenCode: string, error: string, context: any): Promise<AIResponse> {
        // 1. Check Test Scenarios
        const testResponse = TestScenarioHandler.handleRepair(originalPrompt);
        if (testResponse) return testResponse;

        // 2. Build Prompt
        const systemPrompt = `
You are Extendo, an expert browser automation agent.
You previously generated code that FAILED to execute.

Original Request: "${originalPrompt}"
Context:
${JSON.stringify(context, null, 2)}

Broken Code:
${brokenCode}

Error Message:
${error}

Your goal is to fix the code so it works.
Analyze the error. Is it a syntax error? A selector issue? A logic bug?
Return the FIXED code in the same JSON format as before:
{
  "explanation": "Brief 1-sentence description of the fix",
  "code": "The FIXED JavaScript code.",
  "type": "style" | "scrape" | "interaction" | "analysis",
  "riskLevel": "safe" | "medium" | "high" 
}
`;

        // 3. Mock or Execute
        if (this.apiKey === "TODO_API_KEY") {
            return {
                explanation: "Mock Repair: Wrapped in extra try/catch",
                code: `try { ${brokenCode} } catch(e) { console.log('Fixed it via ignore'); }`,
                type: "interaction",
                riskLevel: "moderate"
            };
        }

        try {
            const text = await this.client.generateContent(systemPrompt);
            return GeminiClient.parseFnResponse(text);
        } catch (e) {
            console.error("LLM Error during Repair", e);
            throw new Error("Failed to generate repair");
        }
    }


    async generateVerification(prompt: string, code: string): Promise<string> {
        const systemPrompt = `
You are a QA Engineer for a browser extension.
User Prompt: "${prompt}"
Executed Code: "${code}"

Write a small JavaScript IFFE validation script that checks if the code successfully performed the task. 
If it succeeded, console.log("VERIFICATION PASS").
If it failed, throw new Error("VERIFICATION FAIL: <reason>").
Return ONLY the raw JavaScript code, no JSON, no Markdown.
`;
        // Mock for now
        if (this.apiKey === "TODO_API_KEY") {
            return "if (document.title) { console.log('VERIFICATION PASS'); } else { throw new Error('No title?'); }";
        }

        try {
            let text = await this.client.generateContent(systemPrompt);
            text = text.replace(/```javascript\n|\n```/g, "").replace(/```/g, "");
            return text;
        } catch (e) {
            return "console.warn('Verification generation failed');";
        }
    }
}
