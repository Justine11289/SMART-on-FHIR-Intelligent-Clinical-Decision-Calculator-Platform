# Traceability Matrix

**Project:** MEDCALCEHR
**Module:** APACHE II Calculator
**Version:** 1.0.0

## Traceability Map

**Requirement (SRS)** -> **Design (File/Module)** -> **Verification (Test Case)**

| Requirement ID     | Requirement Summary              | Design / Implementation                                                                                                             | Verification / Test Case                                                                               | Status            |
| ------------------ | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ----------------- |
| **REQ-APACHE-001** | Input: Temperature (Rectal)      | `src/calculators/apache-ii/config.ts` (Input `temp`) <br> `src/calculators/apache-ii/calculation.ts` (`getPoints.temp`)             | `src/__tests__/calculators/apache-ii.test.ts` <br> `TC-001: Temperature Points`                        | ✅ Verified       |
| **REQ-APACHE-002** | Input: Mean Arterial Pressure    | `src/calculators/apache-ii/config.ts` (Input `map`) <br> `src/calculators/apache-ii/calculation.ts` (`getPoints.map`)               | `src/__tests__/calculators/apache-ii.test.ts` <br> `TC-001: MAP Points`                                | ✅ Verified       |
| **REQ-APACHE-003** | Input: Heart Rate                | `src/calculators/apache-ii/config.ts` (Input `heartRate`) <br> `src/calculators/apache-ii/calculation.ts` (`getPoints.hr`)          | `src/__tests__/calculators/apache-ii.test.ts` <br> `TC-001: Heart Rate Points`                         | ✅ Verified       |
| **REQ-APACHE-006** | Input: Arterial pH               | `src/calculators/apache-ii/config.ts` (Input `ph`) <br> `src/calculators/apache-ii/calculation.ts` (`getPoints.ph`)                 | `src/__tests__/calculators/apache-ii.test.ts` <br> `TC-001: pH Points`                                 | ✅ Verified       |
| **REQ-APACHE-009** | Input: Serum Creatinine          | `src/calculators/apache-ii/config.ts` (Input `creatinine`) <br> `src/calculators/apache-ii/calculation.ts` (`getPoints.creatinine`) | `src/__tests__/calculators/apache-ii.test.ts` <br> `TC-001: Creatinine Points`                         | ✅ Verified       |
| **REQ-APACHE-012** | Input: GCS (3-15)                | `src/calculators/apache-ii/config.ts` (Input `gcs`) <br> `src/calculators/apache-ii/calculation.ts` (`getPoints.gcs`)               | `src/__tests__/calculators/apache-ii.test.ts` <br> `TC-001: GCS Points`                                | ✅ Verified       |
| **REQ-APACHE-013** | Input: Age                       | `src/calculators/apache-ii/config.ts` (Input `age`) <br> `src/calculators/apache-ii/calculation.ts` (`getPoints.age`)               | `src/__tests__/calculators/apache-ii.test.ts` <br> `TC-001: Age Points`                                | ✅ Verified       |
| **REQ-APACHE-015** | Logic: Double Cre points for ARF | `src/calculators/apache-ii/calculation.ts` (`getPoints.creatinine`)                                                                 | `src/__tests__/calculators/apache-ii.test.ts` <br> `Test: High creatinine (>=3.5) = 8 points with ARF` | ✅ Verified       |
| **REQ-APACHE-016** | Logic: Total Score Summation     | `src/calculators/apache-ii/calculation.ts` (`calculateTotal`)                                                                       | `src/__tests__/calculators/apache-ii.test.ts` <br> `TC-003: Full Calculation`                          | ✅ Verified       |
| **REQ-APACHE-017** | Output: Mortality Estimation     | `src/calculators/apache-ii/calculation.ts` (`calculateMortality`)                                                                   | `src/__tests__/calculators/apache-ii.test.ts` <br> `TC-002: Mortality Calculation`                     | ✅ Verified       |
| **PERF-002**       | Validation: Input Ranges         | `src/validator.ts`                                                                                                                  | `src/__tests__/validator.test.ts` (Assumed exists)                                                     | ⚠️ Pending Review |

## Coverage Summary

- Total Requirements: 11 (Mapped in this subset)
- Verified: 10
- Pending: 1
- Coverage: 90.9%
