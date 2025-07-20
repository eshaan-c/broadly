import React from "react";
import { cn } from "@/lib/utils";

type CriteriaComparisonGridProps = {
    sortedOptions: any[];
    result: any;
};

type CriteriaComparisonGridState = {
    editableWeights: { [criterionName: string]: number };
    totalScores: { [optionName: string]: number };
    originalWeights: { [criterionName: string]: number };
    hasChanges: boolean;
    totalWeightPercentage: number;
};

export class CriteriaComparisonGrid extends React.Component<
    CriteriaComparisonGridProps,
    CriteriaComparisonGridState
> {
    constructor(props: CriteriaComparisonGridProps) {
        super(props);

        // Initialize weights from criteria comparisons
        const editableWeights: { [criterionName: string]: number } = {};
        const originalWeights: { [criterionName: string]: number } = {};

        props.result.criteriaComparisons.forEach((criterion: any) => {
            editableWeights[criterion.name] = criterion.weight;
            originalWeights[criterion.name] = criterion.weight;
        });

        // Calculate initial total weight percentage
        const totalWeightPercentage = Object.values(editableWeights).reduce(
            (sum, weight) => sum + weight * 100,
            0
        );

        this.state = {
            editableWeights,
            originalWeights,
            totalScores: this.calculateTotalScores(editableWeights),
            hasChanges: false,
            totalWeightPercentage: totalWeightPercentage
        };
    }

    handleWeightChange = (criterionName: string, newWeightPercent: number) => {
        // Convert percentage to decimal (0-1 range) with constraints
        const newWeight = Math.max(0, Math.min(100, newWeightPercent)) / 100;

        // Update weights without normalizing
        const updatedWeights = { ...this.state.editableWeights, [criterionName]: newWeight };

        // Calculate total weight percentage
        const totalWeightPercentage = Object.values(updatedWeights).reduce(
            (sum, weight) => sum + weight * 100,
            0
        );

        // For score calculation, we use normalized weights
        const normalizedWeights = this.getNormalizedWeights(updatedWeights);
        const newTotalScores = this.calculateTotalScores(normalizedWeights);

        // Update state with user's raw weights
        this.setState({
            editableWeights: updatedWeights,
            totalScores: newTotalScores,
            totalWeightPercentage,
            hasChanges: true
        });
    };

    // Get normalized weights for calculations without changing displayed values
    getNormalizedWeights = (weights: { [criterionName: string]: number }) => {
        const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);

        if (totalWeight === 0) {
            const equalWeight = 1 / Object.keys(weights).length;
            return Object.keys(weights).reduce((acc, key) => {
                acc[key] = equalWeight;
                return acc;
            }, {} as { [criterionName: string]: number });
        }

        // Create normalized copy without modifying original
        const normalized = {} as { [criterionName: string]: number };
        for (const [criterion, weight] of Object.entries(weights)) {
            normalized[criterion] = weight / totalWeight;
        }

        return normalized;
    };

    // Explicitly normalize all weights
    normalizeWeights = () => {
        const normalizedWeights = this.getNormalizedWeights(this.state.editableWeights);
        const newTotalScores = this.calculateTotalScores(normalizedWeights);

        this.setState({
            editableWeights: normalizedWeights,
            totalScores: newTotalScores,
            totalWeightPercentage: 100
        });
    };

    calculateTotalScores = (weights: { [criterionName: string]: number }) => {
        const { sortedOptions, result } = this.props;
        const totalScores: { [optionName: string]: number } = {};

        // Calculate score for each option
        sortedOptions.forEach(option => {
            let totalScore = 0;

            // For each criterion, calculate weighted score
            result.criteriaComparisons.forEach((criterion: any) => {
                const criterionName = criterion.name;
                const rawScore = criterion.scores[option.name] || 0;
                const weight = weights[criterionName] || 0;

                // Add weighted score to total
                totalScore += rawScore * weight;
            });

            totalScores[option.name] = totalScore;
        });

        return totalScores;
    };

    resetWeights = () => {
        const originalTotal = Object.values(this.state.originalWeights).reduce(
            (sum, weight) => sum + weight * 100,
            0
        );

        this.setState({
            editableWeights: { ...this.state.originalWeights },
            totalScores: this.calculateTotalScores(this.state.originalWeights),
            hasChanges: false,
            totalWeightPercentage: originalTotal
        });
    };

    render() {
        const { sortedOptions, result } = this.props;
        const { editableWeights, totalScores, hasChanges, totalWeightPercentage } = this.state;

        // Find best option based on recalculated scores
        const bestOptionName = Object.entries(totalScores)
            .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)[0]?.[0];

        // Determine if total weight is valid (100%)
        const isWeightValid = Math.abs(totalWeightPercentage - 100) < 0.1;

        return (
            <div className="space-y-4">
                <div className="flex items-center justify-end space-x-3">
                    {hasChanges && (
                        <>
                            <div className={cn(
                                "text-sm font-medium px-3 py-1 rounded-full",
                                isWeightValid
                                    ? "bg-green-500/20 text-green-300"
                                    : "bg-amber-500/20 text-amber-300"
                            )}>
                                Total: {totalWeightPercentage.toFixed(0)}%
                            </div>

                            {!isWeightValid && (
                                <button
                                    onClick={this.normalizeWeights}
                                    className="px-3 py-1 text-xs bg-amber-600/30 hover:bg-amber-500/30 text-amber-300 rounded-md transition-colors"
                                >
                                    Normalize to 100%
                                </button>
                            )}

                            <button
                                onClick={this.resetWeights}
                                className="px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-md transition-colors"
                            >
                                Reset Weights
                            </button>
                        </>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-700">
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
                                    Criteria
                                </th>
                                {sortedOptions.map((option: any) => (
                                    <th
                                        key={option.name}
                                        className="text-center py-3 px-4 text-sm font-medium text-slate-300"
                                    >
                                        {option.name}
                                    </th>
                                ))}
                                <th className="text-center py-3 px-4 text-sm font-medium text-slate-400">
                                    Weight
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {result.criteriaComparisons.map((criterion: any, idx: number) => {
                                const scores = Object.values(criterion.scores) as number[];
                                const maxScore = Math.max(...scores);
                                const weightPercent = (editableWeights[criterion.name] * 100).toFixed(0);

                                return (
                                    <tr
                                        key={idx}
                                        className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors"
                                    >
                                        <td className="py-4 px-4">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm font-medium text-slate-300">
                                                    {criterion.name}
                                                </span>
                                                {criterion.impact === "high" && (
                                                    <span className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full">
                                                        Decisive
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        {sortedOptions.map((option: any) => {
                                            const score = criterion.scores[option.name] || 0;
                                            const isWinner = score === maxScore && score > 0;

                                            return (
                                                <td key={option.name} className="text-center py-4 px-4">
                                                    <div
                                                        className={cn(
                                                            "inline-flex items-center justify-center w-12 h-12 rounded-lg font-semibold text-sm transition-all",
                                                            isWinner
                                                                ? "bg-gradient-to-br from-amber-500/30 to-yellow-500/30 text-amber-300 border border-amber-500/40"
                                                                : "bg-slate-700/30 text-slate-400"
                                                        )}
                                                    >
                                                        {score.toFixed(1)}
                                                    </div>
                                                </td>
                                            );
                                        })}
                                        <td className="text-center py-4 px-4">
                                            <div className="flex items-center justify-center">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={weightPercent}
                                                    onChange={(e) => {
                                                        const newWeight = parseInt(e.target.value) || 0;
                                                        this.handleWeightChange(criterion.name, newWeight);
                                                    }}
                                                    className="w-16 bg-slate-700/50 border border-slate-600/50 rounded text-center text-sm text-slate-300 py-1 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                                                    aria-label={`Weight for ${criterion.name}`}
                                                />
                                                <span className="text-slate-400 ml-1">%</span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}

                            {/* Total Score row */}
                            <tr className="border-t-2 border-slate-700/70 bg-slate-800/30">
                                <td className="py-4 px-4">
                                    <span className="text-sm font-bold text-slate-200">
                                        Total Score
                                    </span>
                                </td>
                                {sortedOptions.map((option: any) => {
                                    const score = totalScores[option.name] || 0;
                                    const isBest = option.name === bestOptionName;

                                    return (
                                        <td key={option.name} className="text-center py-4 px-4">
                                            <div
                                                className={cn(
                                                    "inline-flex items-center justify-center w-12 h-12 rounded-lg font-bold text-sm transition-all",
                                                    isBest
                                                        ? "bg-gradient-to-br from-amber-500/40 to-yellow-500/40 text-amber-200 border-2 border-amber-500/50"
                                                        : "bg-slate-700/40 text-slate-300"
                                                )}
                                            >
                                                {score.toFixed(1)}
                                            </div>
                                        </td>
                                    );
                                })}
                                <td className="text-center py-4 px-4">
                                    <span className="text-sm font-bold text-slate-300">
                                        100%
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {hasChanges && !isWeightValid && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-sm text-amber-200">
                        <p>
                            Your weights currently sum to {totalWeightPercentage.toFixed(0)}%. For score calculation, these are normalized internally, but you can click "Normalize to 100%" to adjust all weights proportionally.
                        </p>
                    </div>
                )}

                {hasChanges && isWeightValid && (
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 text-sm text-slate-400">
                        <p>
                            Weights total 100%. The scores reflect your weight adjustments.
                        </p>
                    </div>
                )}
            </div>
        );
    }
}