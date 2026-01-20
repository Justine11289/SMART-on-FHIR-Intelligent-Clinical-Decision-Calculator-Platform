# Software Development Plan (SDP)

**Project Name:** MEDCALCEHR
**Safety Class:** Class B (Presumed - Non-serious injury risk from incorrect auxiliary calculation)
**Version:** 1.0.0

## 1. Scope

This document describes the software development plan for the MEDCALCEHR project, a web-based clinical calculator platform compliant with IEC 62304 standards.

## 2. Software Life Cycle Model

We follow an **Iterative / Agile** development model.

- **Planning**: Definition of user needs and medical algorithms.
- **Development**: Implementation using TypeScript, HTML, CSS.
- **Verification**: continuous integration using Jest for unit and integration testing.
- **Release**: Docker-based deployment.

## 3. Configuration Management

- **Version Control System**: Git.
- **Repository Strategy**: Feature Branch Workflow.
    - `main`: Stable, deployable code.
    - `feature/*`: Development branches.
- **Dependency Management**: `package-lock.json` ensures reproducible builds.

## 4. Development Tools

| Tool                | Purpose                        | Version Control |
| ------------------- | ------------------------------ | --------------- |
| VS Code             | IDE                            | No              |
| TypeScript Compiler | Compilation (Static Analysis)  | package.json    |
| Jest                | Automated Testing              | package.json    |
| Docker              | Build & Deployment Environment | Dockerfile      |
| ESlint / Prettier   | Code Quality & Formatting      | package.json    |

## 5. Software Integration and Testing

- **Unit Testing**: Conducted per module (calculator) basis.
- **Integration Testing**: Verified via build scripts and end-to-end flow checks.
- **Standard**: All medical algorithms must be covered by unit tests validating against known literature values or clinical scenarios.

## 6. Problem Resolution

- Issues are tracked via the project's Issue Tracking System (e.g., GitHub Issues).
- Bugs found in released versions are prioritized based on risk (Patient Safety vs. Usability).
