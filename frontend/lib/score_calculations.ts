// frontend/lib/scoreCalculations.ts

interface CriteriaScore {
    raw_score: number;
    // rationale: string;
}

interface OptionScore {
    criteria_scores: Record<string, CriteriaScore>;
    strengths: string[];
    weaknesses: string[];
    confidence: 'high' | 'medium' | 'low';
    inferred_option?: boolean;
}

interface Criterion {
    name: string;
    description: string;
    weight: number;
    category: string;
}

export function calculateWeightedScores(
    optionScores: Record<string, OptionScore>,
    criteria: Criterion[]
): Record<string, {
    totalScore: number;
    weightedCriteriaScores: Record<string, number>;
    rawCriteriaScores: Record<string, number>;
}> {
    const results: Record<string, any> = {};

    // For each option
    Object.entries(optionScores).forEach(([optionName, optionData]) => {
        let totalScore = 0;
        const weightedCriteriaScores: Record<string, number> = {};
        const rawCriteriaScores: Record<string, number> = {};

        // Calculate weighted score for each criterion
        criteria.forEach(criterion => {
            const criteriaScore = optionData.criteria_scores[criterion.name];
            if (criteriaScore) {
                const rawScore = criteriaScore.raw_score;
                const weightedScore = rawScore * criterion.weight;

                rawCriteriaScores[criterion.name] = rawScore;
                weightedCriteriaScores[criterion.name] = weightedScore;
                totalScore += weightedScore;
            }
        });

        results[optionName] = {
            totalScore: Math.round(totalScore * 100) / 100, // Round to 2 decimal places
            weightedCriteriaScores,
            rawCriteriaScores
        };
    });

    return results;
}

// Helper to find the best option
export function findBestOption(
    calculatedScores: ReturnType<typeof calculateWeightedScores>
): string {
    let bestOption = '';
    let highestScore = -1;

    Object.entries(calculatedScores).forEach(([optionName, scores]) => {
        if (scores.totalScore > highestScore) {
            highestScore = scores.totalScore;
            bestOption = optionName;
        }
    });

    return bestOption;
}

// Generate comparison insights
export function generateCriteriaComparisons(
    calculatedScores: ReturnType<typeof calculateWeightedScores>,
    criteria: Criterion[]
): {
    criteriaComparisons: Array<{
        name: string;
        weight: number;
        scores: Record<string, number>;
        winner: string;
        impact: 'high' | 'medium' | 'low';
    }>;
    mostDecisiveCriteria: string[];
    leastDecisiveCriteria: string[];
} {
    const criteriaComparisons: Array<any> = [];

    criteria.forEach(criterion => {
        const scores: Record<string, number> = {};
        let maxScore = -1;
        let minScore = 11;
        let winner = '';

        // Collect all raw scores for this criterion
        Object.entries(calculatedScores).forEach(([optionName, optionScores]) => {
            const rawScore = optionScores.rawCriteriaScores[criterion.name] || 0;
            scores[optionName] = rawScore;

            if (rawScore > maxScore) {
                maxScore = rawScore;
                winner = optionName;
            }
            if (rawScore < minScore) {
                minScore = rawScore;
            }
        });

        // Determine impact based on score variance and weight
        const variance = maxScore - minScore;
        const weightedVariance = variance * criterion.weight;
        const impact = weightedVariance > 2 ? 'high' : weightedVariance > 1 ? 'medium' : 'low';

        criteriaComparisons.push({
            name: criterion.name,
            weight: criterion.weight,
            scores,
            winner,
            impact,
            variance
        });
    });

    // Sort by impact (variance * weight)
    criteriaComparisons.sort((a, b) =>
        (b.variance * b.weight) - (a.variance * a.weight)
    );

    const mostDecisiveCriteria = criteriaComparisons
        .slice(0, 3)
        .filter(c => c.impact === 'high' || c.impact === 'medium')
        .map(c => c.name);

    const leastDecisiveCriteria = criteriaComparisons
        .slice(-3)
        .filter(c => c.variance < 1)
        .map(c => c.name);

    return {
        criteriaComparisons,
        mostDecisiveCriteria,
        leastDecisiveCriteria
    };
}