// frontend/lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api';

interface AnalyzeRequest {
    scenario: string;
    depth: 'quick' | 'balanced' | 'thorough';
}

interface AnalyzeResponse {
    decision_type: string;
    title: string;
    options: Array<{
        name: string;
        description: string;
        inferred: boolean;
    }>;
    criteria: Array<{
        name: string;
        description: string;
        weight: number;
        category: string;
    }>;
    questions: Array<{
        text: string;
        type: 'scale' | 'rank' | 'boolean' | 'text' | 'multiple_choice';
        options?: string[];
        criteria_link: string;
        min?: number; // For scale type questions
        max?: number; // For scale type questions
        minLabel?: string; // For scale type questions
        maxLabel?: string; // For scale type questions
    }>;
    context_factors: string[];
    depth: string;
    scenario_text: string;

    initialOptions: Array<{
        name: string;
        description: string;
        inferred: boolean;
    }>;
}

interface EvaluateRequest {
    framework: AnalyzeResponse;
    responses: Record<string, any>;
}

interface EvaluateResponse {
    option_scores: Record<string, {
        total_score: number;
        criteria_scores: Record<string, number>;
        strengths: string[];
        weaknesses: string[];
        confidence: 'high' | 'medium' | 'low';
    }>;
    recommendation: {
        primary_choice: string;
        reasoning: string;
        alternatives: string[];
        red_flags: string[];
    };
    sensitivity_analysis?: {
        critical_factors: string[];
        robust_choice: string;
    };
    model_used?: string;
    complexity_score?: number;
}

class DecisionAPI {
    private async fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options?.headers,
                },
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    async analyze(request: AnalyzeRequest): Promise<AnalyzeResponse> {
        return this.fetchAPI<AnalyzeResponse>('/analyze', {
            method: 'POST',
            body: JSON.stringify(request),
        });
    }

    async evaluate(request: EvaluateRequest): Promise<EvaluateResponse> {
        return this.fetchAPI<EvaluateResponse>('/evaluate', {
            method: 'POST',
            body: JSON.stringify(request),
        });
    }

    async testConnection(): Promise<{ status: string; message: string }> {
        return this.fetchAPI<{ status: string; message: string }>('/test', {
            method: 'GET',
        });
    }
}

export const decisionAPI = new DecisionAPI();
export type { AnalyzeResponse, EvaluateResponse };
