/**
 * Scoring Calculator Test Utilities
 * Helper functions to simulate score calculation for testing configuration-based calculators
 */
/**
 * Simulate score calculation based on calculator configuration and mock inputs
 * @param config Calculator configuration
 * @param inputs Record of input names and their values (radio string values or checkbox boolean/string)
 */
export function calculateScoringResult(config, inputs) {
    let totalScore = 0;
    const sectionScores = {};
    const inputType = config.inputType || 'radio';
    // 1. Calculate Scores
    if (inputType === 'checkbox') {
        // Checkbox mode
        const sections = config.sections || [];
        sections.forEach((section, sIdx) => {
            const sectionId = section.id || `section-${sIdx}`;
            section.options.forEach((opt, oIdx) => {
                const optId = opt.id || `${sectionId}-${oIdx}`;
                // Input key can be the specific option ID
                if (inputs[optId] === true || inputs[optId] === 'true') {
                    const val = typeof opt.value === 'string' ? parseFloat(opt.value) : opt.value;
                    totalScore += val;
                    sectionScores[sectionId] = (sectionScores[sectionId] || 0) + val;
                }
            });
        });
    }
    else if (inputType === 'yesno' && config.questions && config.sectionTitle) {
        // YesNo mode with questions
        config.questions.forEach(q => {
            const val = inputs[q.id];
            if (val !== undefined && val !== null) {
                const numVal = parseFloat(String(val));
                if (!isNaN(numVal)) {
                    totalScore += numVal;
                    sectionScores[q.id] = numVal;
                }
            }
        });
    }
    else {
        // Radio mode (default) or YesNo without questions
        const sections = inputType === 'yesno' && config.questions
            ? convertYesNoToSections(config.questions)
            : config.sections || [];
        sections.forEach((section, sIdx) => {
            const sectionId = section.id || `section-${sIdx}`;
            const val = inputs[sectionId];
            if (val !== undefined) {
                const numVal = parseFloat(String(val));
                if (!isNaN(numVal)) {
                    totalScore += numVal;
                    sectionScores[sectionId] = numVal;
                }
            }
        });
    }
    // 2. Determine Risk Level
    // Sort risk levels by minScore to ensure correct range checking
    const sortedRisks = [...config.riskLevels].sort((a, b) => a.minScore - b.minScore);
    let riskLevel = sortedRisks.find(r => totalScore >= r.minScore && totalScore <= r.maxScore);
    // Fallback: if not found, use the last one if score is higher than max
    if (!riskLevel && totalScore > sortedRisks[sortedRisks.length - 1].maxScore) {
        riskLevel = sortedRisks[sortedRisks.length - 1];
    }
    // Fallback: use first one if lower (though usually 0 is min)
    if (!riskLevel && totalScore < sortedRisks[0].minScore) {
        riskLevel = sortedRisks[0];
    }
    return {
        totalScore,
        sectionScores,
        riskLevel
    };
}
// Helper specific for YesNo questions conversion (mirrors logic in scoring-calculator.ts)
function convertYesNoToSections(questions) {
    return questions.map(q => ({
        id: q.id,
        title: q.label,
        options: [
            { value: '0', label: 'No' },
            { value: String(q.points), label: 'Yes' }
        ]
    }));
}
