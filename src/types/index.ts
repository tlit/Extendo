export type ExtendoMode = 'style' | 'scrape' | 'interaction' | 'analysis';

export interface SpatialElement {
    id: number;
    rect: {
        x: number;
        y: number;
        width: number;
        height: number;
        top: number;
        left: number;
        bottom: number;
        right: number;
    };
    tagName: string;
    text: string;
    isVisible: boolean;
}

export interface PageContext {
    url: string;
    title: string;
    domSummary: string; // Truncated or summarized HTML
    selection?: string;
    timestamp: number;
    interactiveElements?: SpatialElement[];
}

export interface AIResponse {
    type: ExtendoMode;
    code: string; // The executable JavaScript
    explanation: string; // Why it wrote this
    riskLevel: 'safe' | 'moderate' | 'high';
}

export interface LLMRequest {
    prompt: string;
    context: PageContext;
    apiKey?: string;
}

export interface MicroExtension {
    id: string;
    name: string;
    trigger: string;
    code: string;
    created: number;
    type: ExtendoMode;
    autoRun: boolean;
}
