# Developer Guide: Creating & Validating Calculators

This guide provides a comprehensive standard for creating new medical calculators in this project. It integrates rules for **SaMD (Software as a Medical Device)** compliance, ensuring strict validation, standardized coding, and consistent UI.

---

## 🚨 Critical Development Rules

1.  **Mandatory Clinical Codes**: Every numeric, diagnosis, or medication input **MUST** have a corresponding standard code (LOINC for labs/vitals, SNOMED for conditions, RxNorm for medications).
    - _If a code does not exist in `src/fhir-codes.ts`, you MUST add it._
2.  **Mandatory Validation**: Every numeric input **MUST** have a validation rule (Green/Yellow/Red zones).
    - _If a rule does not exist in `src/validator.ts`, you MUST add it._
3.  **No Raw HTML**: Use the provided Factory functions and `uiBuilder`. Do not write custom HTML structures.
4.  **SaMD Verification**: Every new calculator **MUST** have a corresponding test file in `src/__tests__/calculators/` validation against a "Golden Dataset".
5.  **Calculator Registration**: Every new calculator **MUST** be registered in `src/calculators/index.ts`.

---

## 1. Choosing the Right Factory

| Calculator Type          | Factory Function                 | File Location                                          |
| :----------------------- | :------------------------------- | :----------------------------------------------------- |
| **Point-Based Scores**   | `createScoringCalculator`        | `src/calculators/shared/scoring-calculator.ts`         |
| **Formulas / Equations** | `createUnifiedFormulaCalculator` | `src/calculators/shared/unified-formula-calculator.ts` |
| **Unit Conversions**     | `createConversionCalculator`     | `src/calculators/shared/conversion-calculator.ts`      |

---

## 2. Implementation Steps

### Step 1: Create Files

Create a folder in `src/calculators/` (e.g., `my-calc`).

- `calculation.ts`: Pure function for math logic (for Formula calculators).
- `index.ts`: Configuration and UI definition.

### Step 2: Define Codes (`src/fhir-codes.ts`)

**Check if codes exist.** If not, find the code (e.g., on [loinc.org](https://loinc.org/search/)) and add it:

```typescript
// src/fhir-codes.ts
export const LOINC_CODES = {
    // ... existing codes
    MY_NEW_LAB: '12345-6' // Add your code here
};
```

### Step 3: Define Validation (`src/validator.ts`)

**Check if a validation type exists.** If not, add a new rule defining safe ranges:

```typescript
// src/validator.ts
export const ValidationRules = {
    // ... existing rules
    myNewType: {
        required: true,
        min: 0, // Red Low (Blocker)
        max: 100, // Red High (Blocker)
        warnMin: 10, // Yellow Low (Warning)
        warnMax: 90, // Yellow High (Warning)
        message: 'Value must be 0-100',
        warningMessage: 'Value is unusual'
    }
};
```

### Step 4: Implement Logic (`calculation.ts`)

For **simple calculations** (direct value mapping), use `SimpleCalculateFn`:

```typescript
import type { SimpleCalculateFn } from '../../types/calculator-formula';

export const calculateMyCalc: SimpleCalculateFn = values => {
    const val = Number(values['my-input']);
    if (!val || isNaN(val)) return null;

    return [
        {
            label: 'Result',
            value: (val * 2).toFixed(1),
            unit: 'units',
            alertClass: 'success'
        }
    ];
};
```

For **complex calculations** (needing radio values, unit conversion, etc.), use `ComplexCalculationResult`:

```typescript
import type {
    ComplexCalculationResult,
    GetValueFn,
    GetRadioValueFn
} from '../../types/calculator-formula';

export function calculateMyScore(
    getValue: GetValueFn,
    getStdValue: GetStdValueFn, // Gets value in standard unit
    getRadioValue: GetRadioValueFn
): ComplexCalculationResult | null {
    const age = getValue('my-age');
    const sex = getRadioValue('my-sex'); // Returns string value

    if (age === null) return null;

    let score = age * 0.1;
    if (sex === 'female') score += 0.5;

    return {
        score: score,
        interpretation: score > 5 ? 'High Risk' : 'Low Risk',
        severity: score > 5 ? 'danger' : 'success',
        additionalResults: [{ label: 'Predicted Risk', value: score.toFixed(1), unit: '%' }],
        breakdown: `Age contribution: ${age * 0.1}`
    };
}
```

### Step 5: Configure Calculator (`index.ts`)

#### A. Simple Formula Calculator

```typescript
import { createUnifiedFormulaCalculator } from '../shared/unified-formula-calculator';
import { calculateMyCalc } from './calculation';

export const myCalc = createUnifiedFormulaCalculator({
    id: 'my-calc',
    title: 'My Calculator',
    description: 'Brief description of what this calculates.',

    // Auto-populate from FHIR patient data
    autoPopulateAge: 'my-age',
    autoPopulateGender: 'my-sex',

    sections: [
        {
            title: 'Input Section',
            icon: '📊', // Use emoji icons
            fields: [
                {
                    type: 'number',
                    id: 'my-input',
                    label: 'Input Label',
                    loincCode: LOINC_CODES.MY_LAB,
                    validationType: 'myNewType',
                    unit: 'mg/dL'
                }
            ]
        }
    ],

    calculate: calculateMyCalc
});
```

#### B. Complex Formula Calculator (with Radio fields)

```typescript
import { createUnifiedFormulaCalculator } from '../shared/unified-formula-calculator';
import { calculateMyScore } from './calculation';

export const myRiskCalc = createUnifiedFormulaCalculator({
    id: 'my-risk',
    title: 'My Risk Calculator',

    sections: [
        {
            title: 'Patient Demographics',
            icon: '👤',
            fields: [
                {
                    type: 'number',
                    id: 'my-age',
                    label: 'Age',
                    unit: 'years',
                    validationType: 'age'
                },
                {
                    type: 'radio',
                    name: 'my-sex', // Use 'name' for radio groups
                    label: 'Sex',
                    options: [
                        { value: 'male', label: 'Male', checked: true },
                        { value: 'female', label: 'Female' }
                    ]
                }
            ]
        },
        {
            title: 'Risk Factors',
            icon: '⚠️',
            fields: [
                {
                    type: 'radio',
                    name: 'my-severity',
                    label: 'Severity',
                    helpText: 'Additional explanation shown below the label',
                    options: [
                        { value: 'none', label: 'None', checked: true },
                        { value: 'mild', label: 'Mild' },
                        { value: 'moderate', label: 'Moderate' },
                        { value: 'severe', label: 'Severe' }
                    ]
                }
            ]
        }
    ],

    // Use complexCalculate for radio/checkbox access
    complexCalculate: calculateMyScore,

    // Formula documentation
    formulaSection: {
        show: true,
        title: 'Scoring Criteria',
        calculationNote: 'Score = Age × 0.1 + Sex factor',
        scoringCriteria: [
            { criteria: 'Age Factor', isHeader: true },
            { criteria: 'Per year of age', points: '+0.1' },
            { criteria: 'Sex Factor', isHeader: true },
            { criteria: 'Male', points: '0' },
            { criteria: 'Female', points: '+0.5' }
        ]
    },

    // Reference section with risk stratification
    reference: `
        ${uiBuilder.createSection({
            title: 'Risk Stratification',
            icon: '📊',
            content: uiBuilder.createTable({
                headers: ['Score', 'Risk Level'],
                rows: [
                    ['<5', 'Low Risk'],
                    ['≥5', 'High Risk']
                ]
            })
        })}
        
        ${uiBuilder.createSection({
            title: 'Reference',
            icon: '📚',
            content: '<p>Author et al. Journal Name. Year;Vol:Pages.</p>'
        })}
    `
});
```

#### C. Scoring Calculator Example

```typescript
import { createScoringCalculator } from '../shared/scoring-calculator';

export const myScore = createScoringCalculator({
    id: 'my-score',
    title: 'My Score',
    inputType: 'checkbox', // or 'radio', 'yesno'
    sections: [
        {
            title: 'Risk Factors',
            options: [{ id: 'opt1', label: 'Factor 1', value: 1 }]
        }
    ],
    riskLevels: [{ minScore: 0, maxScore: 1, severity: 'success', label: 'Low Risk' }]
});
```

### Step 6: Register Calculator

Add entry to `src/calculators/index.ts`:

```typescript
export const calculatorModules: CalculatorMetadata[] = [
    // ... existing calculators
    {
        id: 'my-calc',
        title: 'My Calculator Title',
        category: 'cardiovascular' // Choose from: cardiovascular, renal, critical-care, etc.
    }
    // ...
];
```

---

## 3. SaMD Verification & Testing

Every calculator must be verified. Create `src/__tests__/calculators/my-calc.test.ts`.

### Required Test Cases (TC)

- **TC-001 (Coefficients)**: Verify all formula coefficients match published values.
- **TC-002 (Standard)**: Verify standard input calculates correctly.
- **TC-003 (Classification)**: Verify risk levels (Low/Medium/High) trigger correctly.
- **TC-004 (Boundary)**: Test values exactly at cut-off points.
- **TC-005 (Invalid)**: Test zeros, negatives, or missing inputs (should return `null`).
- **TC-006 (Golden Dataset)**: Test against known-good clinical examples.

### Test Template for Scoring Calculator

For calculators created with `createScoringCalculator`, logic is encapsulated. To test:

1.  **Export Config**: In your calculator's `index.ts`, export the configuration object.

    ```typescript
    // src/calculators/my-score/index.ts
    export const myScoreConfig: ScoringCalculatorConfig = { ... };
    export const myScore = createScoringCalculator(myScoreConfig);
    ```

2.  **Use Test Utility**: Use `calculateScoringResult` helper.

```typescript
// src/__tests__/calculators/my-score.test.ts
import { describe, expect, test } from '@jest/globals';
import { myScoreConfig } from '../../calculators/my-score/index';
import { calculateScoringResult } from '../utils/scoring-test-utils';

describe('My Score Calculator', () => {
    test('Config Validation', () => {
        expect(myScoreConfig.id).toBe('my-score');
    });

    test('Score Calculation', () => {
        // Mock input map: key is field ID, value is selected value
        const inputs = {
            'field-1': '1', // Selected 'Yes' (+1)
            'field-2': '0' // Selected 'No' (0)
        };

        const result = calculateScoringResult(myScoreConfig, inputs);

        expect(result.totalScore).toBe(1);
        expect(result.riskLevel?.label).toBe('Low Risk');
    });
});
```

### Test Template for Complex Calculator

```typescript
import { calculateMyScore, COEFFICIENTS } from '../../calculators/my-calc/calculation';

describe('My Calc SaMD Validation', () => {
    // Mock functions
    const createMockGetter = (values: Record<string, number | null>) => (key: string) =>
        values[key] ?? null;

    const createMockRadioGetter = (values: Record<string, string>) => (key: string) =>
        values[key] || '';

    test('TC-001: Coefficients match published values', () => {
        expect(COEFFICIENTS.age).toBeCloseTo(0.1, 2);
    });

    test('TC-002: Standard Calculation', () => {
        const result = calculateMyScore(
            createMockGetter({ 'my-age': 50 }),
            createMockGetter({ 'my-age': 50 }),
            createMockRadioGetter({ 'my-sex': 'male' })
        );
        expect(result).not.toBeNull();
        expect(result?.score).toBeCloseTo(5.0, 1);
    });

    test('TC-005: Missing required returns null', () => {
        const result = calculateMyScore(
            createMockGetter({ 'my-age': null }),
            createMockGetter({ 'my-age': null }),
            createMockRadioGetter({})
        );
        expect(result).toBeNull();
    });
});
```

---

## 4. UI Best Practices

### Using `uiBuilder` Methods

Use `uiBuilder` for consistent styling. **Never write raw HTML.**

```typescript
import { uiBuilder } from '../../ui-builder.js';

// 1. Create styled lists (instead of raw <ul><li>)
infoAlert: `
    <strong>Important Notes:</strong>
    ${uiBuilder.createList({
        items: [
            'First point',
            'Second point',
            'Third point'
        ],
        type: 'ul'  // or 'ol' for ordered list
    })}
`,

// 2. Create sections with icons
reference: `
    ${uiBuilder.createSection({
        title: 'Risk Stratification',
        icon: '📊',
        content: uiBuilder.createTable({
            headers: ['Score', 'Risk Level'],
            rows: [
                ['<5', 'Low Risk'],
                ['≥5', 'High Risk']
            ]
        })
    })}
`,

// 3. Create tables
uiBuilder.createTable({
    headers: ['Column 1', 'Column 2'],
    rows: [
        ['Row 1 Col 1', 'Row 1 Col 2'],
        ['Row 2 Col 1', 'Row 2 Col 2']
    ]
})
```

### Config Options

- **`infoAlert`**: Clinical notes and important information
- **`warningAlert`**: Safety warnings
- **`formulas`**: Display mathematical formulas
- **`formulaSection`**: Scoring criteria table with `scoringCriteria` array
- **`reference`**: Reference section at bottom

### Field Options

- **`icon`**: Emoji icons in section titles (e.g., '👤', '🧪', '❤️', '💓')
- **`helpText`**: Additional clarification below field label
- **`placeholder`**: Example input text

---

## 5. FHIR Auto-Population

### Enable Auto-Population

Add `loincCode` to numeric fields for automatic FHIR data population:

```typescript
{
    type: 'number',
    id: 'my-sbp',
    label: 'Systolic BP',
    loincCode: LOINC_CODES.SYSTOLIC_BP,  // Will auto-fill from FHIR
    unit: 'mmHg',
    validationType: 'systolicBP'
}
```

### Common LOINC Codes (already in `fhir-codes.ts`)

| Variable     | Code Name                  | LOINC   |
| ------------ | -------------------------- | ------- |
| Systolic BP  | `LOINC_CODES.SYSTOLIC_BP`  | 8480-6  |
| Diastolic BP | `LOINC_CODES.DIASTOLIC_BP` | 8462-4  |
| Heart Rate   | `LOINC_CODES.HEART_RATE`   | 8867-4  |
| Height       | `LOINC_CODES.HEIGHT`       | 8302-2  |
| Weight       | `LOINC_CODES.WEIGHT`       | 29463-7 |
| Temperature  | `LOINC_CODES.TEMPERATURE`  | 8310-5  |
| Hemoglobin   | `LOINC_CODES.HEMOGLOBIN`   | 718-7   |
| Creatinine   | `LOINC_CODES.CREATININE`   | 2160-0  |
| Glucose      | `LOINC_CODES.GLUCOSE`      | 2345-7  |

### Auto-Populate Patient Demographics

Use these config options for automatic age/sex population:

```typescript
export const myCalc = createUnifiedFormulaCalculator({
    // ... other config
    autoPopulateAge: 'my-age-field-id', // Field ID for age
    autoPopulateGender: 'my-sex-field-id' // Field ID for sex (radio)
});
```

### Auto-Populate Radio Fields from Observations

For radio fields where FHIR values map to categories (e.g., LVEF % → Good/Moderate/Poor):

```typescript
{
    type: 'radio',
    name: 'es2-lvef',
    label: 'LV Function (LVEF)',
    loincCode: LOINC_CODES.LVEF,  // Maps LVEF % to categories
    options: [
        { value: 'good', label: 'Good (≥51%)', checked: true },
        { value: 'moderate', label: 'Moderate (31-50%)' },
        { value: 'poor', label: 'Poor (21-30%)' },
        { value: 'very-poor', label: 'Very poor (≤20%)' }
    ]
}
```

### Auto-Populate from Conditions (snomedCode)

Use `snomedCode` on radio fields to detect if patient has a condition:

```typescript
{
    type: 'radio',
    name: 'es2-diabetes',
    label: 'Insulin-dependent Diabetes Mellitus',
    snomedCode: SNOMED_CODES.DIABETES_TYPE_1,  // Auto-select "Yes" if condition found
    options: [
        { value: '0', label: 'No', checked: true },
        { value: '1', label: 'Yes' }
    ]
}
```

### Common SNOMED Codes for Conditions

| Condition       | Code Name                              | SNOMED    |
| --------------- | -------------------------------------- | --------- |
| Hypertension    | `SNOMED_CODES.HYPERTENSION`            | 38341003  |
| CAD             | `SNOMED_CODES.CORONARY_ARTERY_DISEASE` | 53741008  |
| IHD             | `SNOMED_CODES.ISCHEMIC_HEART_DISEASE`  | 414545008 |
| Type 1 Diabetes | `SNOMED_CODES.DIABETES_TYPE_1`         | 46635009  |
| Type 2 Diabetes | `SNOMED_CODES.DIABETES_TYPE_2`         | 44054006  |
| Hyperlipidemia  | `SNOMED_CODES.HYPERLIPIDEMIA`          | 55822004  |
| COPD            | `SNOMED_CODES.COPD`                    | 13645005  |
| Heart Failure   | `SNOMED_CODES.HEART_FAILURE`           | 84114007  |
| MI              | `SNOMED_CODES.MYOCARDIAL_INFARCTION`   | 22298006  |
| DVT             | `SNOMED_CODES.DEEP_VEIN_THROMBOSIS`    | 128053003 |
| Malignancy      | `SNOMED_CODES.MALIGNANCY`              | 363346000 |
| Paralysis       | `SNOMED_CODES.PARALYSIS`               | 166001    |

### RxNorm Codes for Medications

Use `RXNORM_CODES` for medication detection:

```typescript
import { RXNORM_CODES } from '../../fhir-codes.js';

// In customInitialize:
const onAspirin = await fhirDataService.isOnMedication([RXNORM_CODES.ASPIRIN]);
```

| Medication  | Code Name                  | RxNorm  |
| ----------- | -------------------------- | ------- |
| Aspirin     | `RXNORM_CODES.ASPIRIN`     | 1191    |
| Clopidogrel | `RXNORM_CODES.CLOPIDOGREL` | 32968   |
| Ticagrelor  | `RXNORM_CODES.TICAGRELOR`  | 1116632 |
| Warfarin    | `RXNORM_CODES.WARFARIN`    | 11289   |
| Rivaroxaban | `RXNORM_CODES.RIVAROXABAN` | 1114195 |
| Apixaban    | `RXNORM_CODES.APIXABAN`    | 1364430 |

### Custom FHIR Initialization

For complex auto-population logic, use `customInitialize`:

```typescript
customInitialize: async (client, patient, container, calculate) => {
    // Check conditions
    const hasHTN = await fhirDataService.hasCondition([SNOMED_CODES.HYPERTENSION]);
    if (hasHTN) {
        const checkbox = container.querySelector('#my-htn-checkbox') as HTMLInputElement;
        if (checkbox) checkbox.checked = true;
    }

    // Check medications
    const onAspirin = await fhirDataService.isOnMedication([RXNORM_CODES.ASPIRIN]);
    // ...
};
```

### Additional LOINC Codes for Cardiac

| Variable | Code Name          | LOINC   |
| -------- | ------------------ | ------- |
| LVEF     | `LOINC_CODES.LVEF` | 10230-1 |
| eGFR     | `LOINC_CODES.EGFR` | 33914-3 |

---

## Summary Checklist

- [ ] Does every numeric input have a `loincCode`?
- [ ] Does every numeric input have a `validationType`?
- [ ] Do Yes/No radio fields have `snomedCode` for condition detection?
- [ ] Are hardcoded SNOMED/LOINC/RxNorm codes replaced with constants?
- [ ] Are missing codes added to `fhir-codes.ts`?
- [ ] Are missing validation rules added to `validator.ts`?
- [ ] Is `uiBuilder` / factory used (no raw HTML)?
- [ ] Is the calculator registered in `src/calculators/index.ts`?
- [ ] Is there a test file verifying the calculation?
- [ ] Are coefficients exported and tested against published values?
- [ ] Is `autoPopulateAge` / `autoPopulateGender` configured if applicable?
