# Software Requirements Specification (SRS)

**Focus Module:** APACHE II Calculator
**Version:** 1.0.0

## 1. Functional Requirements

| ID                 | Description                                                                                                      | Source             | Risk Class |
| ------------------ | ---------------------------------------------------------------------------------------------------------------- | ------------------ | ---------- |
| **REQ-GEN-001**    | The system shall provide a user interface to select the APACHE II calculator.                                    | User               | A          |
| **REQ-APACHE-001** | The calculator must accept input for **Temperature** (Rectal).                                                   | Knaus et al., 1985 | B          |
| **REQ-APACHE-002** | The calculator must accept input for **Mean Arterial Pressure (MAP)**.                                           | Knaus et al., 1985 | B          |
| **REQ-APACHE-003** | The calculator must accept input for **Heart Rate**.                                                             | Knaus et al., 1985 | B          |
| **REQ-APACHE-004** | The calculator must accept input for **Respiratory Rate**.                                                       | Knaus et al., 1985 | B          |
| **REQ-APACHE-005** | The calculator must accept input for **Oxygenation (AaDO2 or PaO2)**.                                            | Knaus et al., 1985 | B          |
| **REQ-APACHE-006** | The calculator must accept input for **Arterial pH**.                                                            | Knaus et al., 1985 | B          |
| **REQ-APACHE-007** | The calculator must accept input for **Serum Sodium**.                                                           | Knaus et al., 1985 | B          |
| **REQ-APACHE-008** | The calculator must accept input for **Serum Potassium**.                                                        | Knaus et al., 1985 | B          |
| **REQ-APACHE-009** | The calculator must accept input for **Serum Creatinine**.                                                       | Knaus et al., 1985 | B          |
| **REQ-APACHE-010** | The calculator must accept input for **Hematocrit**.                                                             | Knaus et al., 1985 | B          |
| **REQ-APACHE-011** | The calculator must accept input for **White Blood Count (WBC)**.                                                | Knaus et al., 1985 | B          |
| **REQ-APACHE-012** | The calculator must accept input for **Glasgow Coma Score (GCS)** range 3-15.                                    | Knaus et al., 1985 | B          |
| **REQ-APACHE-013** | The calculator must accept input for **Age**.                                                                    | Knaus et al., 1985 | B          |
| **REQ-APACHE-014** | The calculator must provided a check for **Chronic Health Status** history.                                      | Knaus et al., 1985 | B          |
| **REQ-APACHE-015** | The calculator shall double the point weight for Creatinine if "Acute Renal Failure" is present.                 | Knaus et al., 1985 | B          |
| **REQ-APACHE-016** | The system shall compute the total score by summing points from A (Physiology), B (Age), and C (Chronic Health). | Knaus et al., 1985 | B          |
| **REQ-APACHE-017** | The system shall estimate mortality percentage based on the final total score.                                   | Knaus et al., 1985 | B          |

## 2. Performance Requirements

| ID           | Description                                                                                   |
| ------------ | --------------------------------------------------------------------------------------------- |
| **PERF-001** | Calculation results shall be displayed within 1 second of complete data entry.                |
| **PERF-002** | The application shall validate input ranges (e.g., Temp 30-45) to prevent calculation errors. |

## 3. Interface Requirements

| ID          | Description                                                                                      |
| ----------- | ------------------------------------------------------------------------------------------------ |
| **INT-001** | The calculator shall support auto-population of Labs via FHIR/LOINC integration where available. |
