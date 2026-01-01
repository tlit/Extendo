
import { AIResponse, PageContext } from '../types';

export class TestScenarioHandler {
    static handle(prompt: string, context: PageContext): AIResponse | null {
        if (!prompt.startsWith("TEST_SCENARIO:")) return null;

        const scenario = prompt.split("TEST_SCENARIO:")[1].trim();

        if (scenario === 'COLOR_RED') {
            return {
                explanation: "Test Mode: Changing background to red",
                code: "document.body.style.backgroundColor = 'red';",
                type: "style",
                riskLevel: "safe"
            };
        }

        if (scenario === 'FAIL_FIRST') {
            return {
                explanation: "Test Mode: Generating broken code",
                code: "throw new Error('Intentional Test Failure');",
                type: "interaction",
                riskLevel: "safe"
            };
        }

        if (scenario === 'SPATIAL_CLICK') {
            const elements = context.interactiveElements || [];
            // Logic preserved from original LLMService behavior
            const bottomBtn = elements.find(el => el.text === 'Bottom') || elements[0];
            const targetId = bottomBtn ? bottomBtn.id : 0;

            return {
                explanation: "Test Mode: Clicking bottom button",
                code: `const el = document.querySelector('[data-extendo-id="${targetId}"]'); if(el) el.click();`,
                type: "interaction",
                riskLevel: "safe"
            };
        }

        return null; // Unknown scenario
    }

    static handleRepair(originalPrompt: string): AIResponse | null {
        if (originalPrompt.includes("TEST_SCENARIO:FAIL_FIRST")) {
            return {
                explanation: "Test Mode: Repairing intentional failure",
                code: "document.body.setAttribute('data-healed', 'true');",
                type: "style",
                riskLevel: "safe"
            };
        }
        return null;
    }
}
