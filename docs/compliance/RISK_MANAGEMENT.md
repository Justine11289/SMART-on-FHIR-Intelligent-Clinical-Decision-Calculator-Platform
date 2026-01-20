# Risk Management File (ISO 14971)

**Product:** MEDCALCEHR
**Module:** APACHE II Calculator
**Version:** 1.0.0

## 1. Risk Analysis Method

We utilize **Failure Mode and Effects Analysis (FMEA)** to identify, evaluate, and control risks associated with the medical device software.

### Severity Levels (S)

1.  **Negligible**: Inconvenience or temporary discomfort.
2.  **Minor**: Results in temporary injury or impairment not requiring professional medical intervention.
3.  **Serious**: Results in injury or impairment requiring professional medical intervention.
4.  **Critical**: Results in permanent impairment or life-threatening injury.
5.  **Catastrophic**: Results in patient death.

### Probability Levels (P)

1.  **Improbable**: < 10^-6
2.  **Remote**: 10^-6 to 10^-4
3.  **Occasional**: 10^-4 to 10^-2
4.  **Probable**: 10^-2 to 10^-1
5.  **Frequent**: > 10^-1

### Risk Evaluation Matrix

Risk Score = S \* P

- **Acceptable (Green)**: Score 1-4
- **ALARP (Yellow)**: Score 5-9 (As Low As Reasonably Practicable - Requires mitigation)
- **Unacceptable (Red)**: Score 10+ (Must be mitigated)

## 2. Failure Mode and Effects Analysis (FMEA)

| ID           | Failure Mode                                   | Cause                                                       | Hazard                                                                                                      | Severity (S)   | Probability (P) | Risk Score            | Risk Control Measure                                                                                                                  | verification of Control                                              | Residual Risk           |
| ------------ | ---------------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | -------------- | --------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ----------------------- |
| **RISK-001** | Input of physiologically impossible Correction | User typo (e.g., Temp 370 instead of 37.0)                  | Calculation result is wildly incorrect, leading to wrong severity assessment.                               | 3 (Serious)    | 3 (Occasional)  | **9 (ALARP)**         | **Software Constraint**: `validator.ts` enforces strict ranges (e.g., Temp 30-45°C). Inputs outside range are rejected with an alert. | Unit Test: `validator.test.ts` checks boundaries.                    | Acceptable (3 \* 1 = 3) |
| **RISK-002** | FHIR Data Staleness                            | Lab results fetched are outdated (e.g., from 3 months ago). | Algorithm uses old data to calculate current mortality risk, leading to incorrect clinical picture.         | 3 (Serious)    | 4 (Probable)    | **12 (Unacceptable)** | **User Information**: Display "Data Date" clearly next to auto-populated fields. Highlight/Warn if data is older than 24 hours.       | UI Verification: Check data date warning logic.                      | Acceptable (3 \* 2 = 6) |
| **RISK-003** | Incorrect Unit Conversion                      | Lab sends Creatinine in µmol/L, calculator expects mg/dL.   | Score inflated or deflated significantly (e.g., factor of 88.4).                                            | 4 (Critical)   | 2 (Remote)      | **8 (ALARP)**         | **Architecture**: Integrated `UnitConverter` module handles conversion standardization before calculation.                            | Unit Test: `unit-converter.test.ts` validates various unit mappings. | Acceptable (4 \* 1 = 4) |
| **RISK-004** | Integer Overflow / Floating Point Error        | Javascript floating point precision issues.                 | Minor score inaccuracy.                                                                                     | 1 (Negligible) | 3 (Occasional)  | **3 (Acceptable)**    | Code Review: Ensure integers are used for point scoring. Round final results to 1 decimal place.                                      | Unit Test: `apache-ii.test.ts` verifies exact point matches.         | Acceptable              |
| **RISK-005** | Server Downtime (FHIR)                         | Hospital FHIR server unreachable.                           | Calculator cannot auto-populate. User must manually enter 15+ fields, increasing workload and error chance. | 2 (Minor)      | 3 (Occasional)  | **6 (ALARP)**         | **Fail-safe**: System gracefully handles connection errors, allows manual entry, and notifies user "Auto-population failed".          | Integration Test: Simulate offline mode.                             | Acceptable              |

## 3. Benefit-Risk Analysis

The implementation of the APACHE II calculator provides rapid, standardized mortality risk assessment, which significantly aids in triage and resource allocation in ICUs. The residual risks after mitigation are primarily related to user entry errors or extreme edge cases, which are standard for any manual or semi-automated medical tool. The benefits of automated data retrieval and standardized scoring outweigh the residual risks.
