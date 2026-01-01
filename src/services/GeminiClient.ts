
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

export class GeminiClient {
    constructor(private apiKey: string) { }

    async generateContent(systemPrompt: string): Promise<any> {
        // Mock fallback for missing API key (preserved from original logic)
        if (this.apiKey === "TODO_API_KEY") {
            // In the original code, the return value structure depended on the caller (generateCode vs generateVerification).
            // However, the caller expects a parsed JSON or a string. 
            // To keep this client simple, we should arguably just return the raw text or the JSON structure.
            // But the original mocks returned full objects.
            // We'll throw specific errors or handle mocks at a higher level? 
            // Actually, strict refactoring means preserving behavior.
            // The original `LLMService` checked `this.apiKey === "TODO_API_KEY"` and returned a hardcoded object immediately.
            // It didn't call the API.
            // So this client should probably only handle the ACTUAL API call.
            throw new Error("API Key not configured");
        }

        try {
            const response = await fetch(GEMINI_API_URL + "?key=" + this.apiKey, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: systemPrompt }] }]
                })
            });

            if (!response.ok) throw new Error(response.statusText);
            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
        } catch (e) {
            console.error("Gemini API Error", e);
            throw e;
        }
    }

    /**
     * Helper to parse the markdown-wrapped JSON often returned by LLMs
     */
    static parseFnResponse(text: string): any {
        const jsonStr = text.replace(/```json\n|\n```/g, "").replace(/^```/, "").replace(/```$/, "");
        return JSON.parse(jsonStr);
    }
}
