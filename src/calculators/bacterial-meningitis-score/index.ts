import { createScoringCalculator, ScoringCalculatorConfig } from '../shared/scoring-calculator.js';
import { fhirDataService } from '../../fhir-data-service.js';
import { uiBuilder } from '../../ui-builder.js';
import { LOINC_CODES, SNOMED_CODES } from '../../fhir-codes.js';

export const bacterialMeningitisScoreConfig: ScoringCalculatorConfig = {
    id: 'bacterial-meningitis-score',
    title: 'Bacterial Meningitis Score for Children',
    description: 'Rules out bacterial meningitis in children aged 29 days to 19 years.',
    infoAlert: `
        <strong>INSTRUCTIONS:</strong> Use in patients aged <strong>29 days to 19 years</strong> with CSF WBC ≥10 cells/μL.<br><br>
        <strong>Do not use if:</strong> Patient is critically ill, recently received antibiotics, has a VP shunt or recent neurosurgery, is immunosuppressed, or has other bacterial infection requiring antibiotics (including Lyme disease).
    `,
    sections: [
        {
            id: 'gram_stain',
            title: 'CSF Gram stain positive',
            subtitle: 'Cerebrospinal fluid microscopy',
            options: [
                { value: '0', label: 'No (0)', checked: true },
                { value: '2', label: 'Yes (+2)' }
            ]
        },
        {
            id: 'csf_anc',
            title: 'CSF ANC ≥1,000 cells/μL',
            subtitle: 'Absolute neutrophil count in CSF',
            options: [
                { value: '0', label: 'No (0)', checked: true },
                { value: '1', label: 'Yes (+1)' }
            ]
        },
        {
            id: 'csf_protein',
            title: 'CSF protein ≥80 mg/dL (800 mg/L)',
            subtitle: 'Protein concentration in CSF',
            options: [
                { value: '0', label: 'No (0)', checked: true },
                { value: '1', label: 'Yes (+1)' }
            ]
        },
        {
            id: 'blood_anc',
            title: 'Peripheral blood ANC ≥10,000 cells/μL',
            subtitle: 'Absolute neutrophil count in blood',
            options: [
                { value: '0', label: 'No (0)', checked: true },
                { value: '1', label: 'Yes (+1)' }
            ]
        },
        {
            id: 'seizure',
            title: 'Seizure at (or prior to) initial presentation',
            subtitle: 'Any seizure activity documented',
            options: [
                { value: '0', label: 'No (0)', checked: true },
                { value: '1', label: 'Yes (+1)' }
            ]
        }
    ],
    riskLevels: [
        { minScore: 0, maxScore: 0, label: 'Very Low Risk', severity: 'success' },
        { minScore: 1, maxScore: 6, label: 'Not Low Risk', severity: 'danger' }
    ],
    formulaSection: {
        show: true,
        title: 'Formula',
        calculationNote: 'Addition of the selected points:',
        scoringCriteria: [
            // CSF Gram stain
            { criteria: 'CSF Gram stain', isHeader: true },
            { criteria: 'Negative', points: '0' },
            { criteria: 'Positive', points: '2' },
            // CSF ANC
            { criteria: 'CSF absolute neutrophil count (ANC)', isHeader: true },
            { criteria: '<1,000 cells/μL', points: '0' },
            { criteria: '≥1,000 cells/μL', points: '1' },
            // CSF protein
            { criteria: 'CSF protein', isHeader: true },
            { criteria: '<80 mg/dL (800 mg/L)', points: '0' },
            { criteria: '≥80 mg/dL (800 mg/L)', points: '1' },
            // Peripheral blood ANC
            { criteria: 'Peripheral blood ANC', isHeader: true },
            { criteria: '<10,000 cells/μL', points: '0' },
            { criteria: '≥10,000 cells/μL', points: '1' },
            // Seizure
            { criteria: 'Seizure at (or prior to) initial presentation', isHeader: true },
            { criteria: 'No', points: '0' },
            { criteria: 'Yes', points: '1' }
        ],
        interpretationTitle: 'Facts & Figures',
        tableHeaders: ['Bacterial Meningitis Score', 'Risk for Bacterial Meningitis'],
        interpretations: [
            { score: '0', interpretation: 'Very low risk', severity: 'success' },
            { score: '>0', interpretation: 'Not very low risk', severity: 'danger' }
        ]
    },
    customResultRenderer: (score: number) => {
        const isLowRisk = score === 0;
        const interpretation = isLowRisk
            ? 'Very low risk for bacterial meningitis.'
            : 'NOT very low risk for bacterial meningitis.';
        const alertType = isLowRisk ? 'success' : 'danger';

        return `
            ${uiBuilder.createResultItem({
                label: 'Total Score',
                value: score.toString(),
                unit: 'points',
                interpretation: isLowRisk ? 'Very Low Risk' : 'Not Low Risk',
                alertClass: `ui-alert-${alertType}`
            })}
            ${uiBuilder.createAlert({
                type: alertType,
                message: `<strong>Interpretation:</strong> ${interpretation}`
            })}
        `;
    },
    customInitialize: async (
        client: unknown,
        patient: unknown,
        container: HTMLElement,
        calculate: () => void
    ) => {
        // Initialize fhirDataService with the client and patient
        fhirDataService.initialize(client, patient, container);

        const setRadio = (name: string, value: string) => {
            const radio = container.querySelector(
                `input[name="${name}"][value="${value}"]`
            ) as HTMLInputElement;
            if (radio) {
                radio.checked = true;
                radio.dispatchEvent(new Event('change', { bubbles: true }));
            }
        };

        if (fhirDataService.isReady()) {
            try {
                // CSF Gram Stain (LOINC: 664-3) - needs raw observation for CodeableConcept
                const gramStainObs = await fhirDataService.getRawObservation(
                    LOINC_CODES.CSF_GRAM_STAIN
                );
                if (gramStainObs?.valueCodeableConcept?.coding) {
                    const isPositive = gramStainObs.valueCodeableConcept.coding.some(
                        (c: any) => c.code === SNOMED_CODES.POSITIVE_RESULT
                    );
                    if (isPositive) {
                        setRadio('gram_stain', '2');
                    }
                }

                // CSF ANC (LOINC: 26485-3)
                const csfAncResult = await fhirDataService.getObservation(LOINC_CODES.CSF_ANC, {
                    trackStaleness: true,
                    stalenessLabel: 'CSF ANC'
                });
                if (csfAncResult.value !== null && csfAncResult.value >= 1000) {
                    setRadio('csf_anc', '1');
                }

                // CSF Protein (LOINC: 3137-7)
                const csfProteinResult = await fhirDataService.getObservation(
                    LOINC_CODES.CSF_PROTEIN,
                    {
                        trackStaleness: true,
                        stalenessLabel: 'CSF Protein'
                    }
                );
                if (csfProteinResult.value !== null && csfProteinResult.value >= 80) {
                    setRadio('csf_protein', '1');
                }

                // Peripheral Blood ANC (LOINC: 751-8)
                const bloodAncResult = await fhirDataService.getObservation(
                    LOINC_CODES.NEUTROPHILS_ABSOLUTE,
                    {
                        trackStaleness: true,
                        stalenessLabel: 'Blood ANC'
                    }
                );
                if (bloodAncResult.value !== null && bloodAncResult.value >= 10000) {
                    setRadio('blood_anc', '1');
                }

                // Seizure (SNOMED coverage)
                const hasSeizure = await fhirDataService.hasCondition([SNOMED_CODES.SEIZURE]);
                if (hasSeizure) {
                    setRadio('seizure', '1');
                }
            } catch (e) {
                console.warn('Error auto-populating bacterial meningitis score:', e);
            }
        }

        calculate();
    }
};

export const bacterialMeningitisScore = createScoringCalculator(bacterialMeningitisScoreConfig);
