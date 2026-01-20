# SOUP List (Software of Unknown Provenance)

List of third-party software components used in the medical device software.

| Component Name | Version | Purpose                          | Risk Assessment          | Mitigation                                      |
| -------------- | ------- | -------------------------------- | ------------------------ | ----------------------------------------------- |
| **chart.js**   | ^4.4.1  | Data visualization (Risk charts) | Low (Visualization only) | Verify displayed data against raw numbers.      |
| **fhirclient** | ^2.5.2  | Communication with FHIR Servers  | Medium (Data Integrity)  | Validate all fetched data; Allow user override. |
| **typescript** | ^5.9.3  | Compiler / Transpiler            | Low (Build tool)         | Use strict type checking; Review TS errors.     |
| **jest**       | ^29.7.0 | Testing Framework                | Low (Verification tool)  | Review test logs manually.                      |
| **node.js**    | LTS     | Runtime Environment              | Low                      | N/A                                             |
