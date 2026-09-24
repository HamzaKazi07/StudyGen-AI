<!--
Sync Impact Report
- Version change: scaffold -> 1.0.0
- Modified principles: template placeholders -> eight StudyGen-AI principles
- Added sections: Technical Boundaries, Development Workflow
- Removed sections: none
- Follow-up TODOs: confirm the original ratification date
-->

# StudyGen-AI Constitution

## Core Principles

### I. Student-Focused Usability
Every user-facing change MUST help students complete a study task with clear language,
predictable navigation, and accessible interaction. Features MUST account for loading,
empty, success, and failure states. The simplest useful workflow is preferred over
additional configuration or decoration.

### II. Document-Grounded AI
AI tutor responses MUST be grounded in the user’s available study documents when the
question depends on them. The system MUST distinguish document-supported information
from general knowledge, MUST avoid presenting unsupported claims as document facts, and
MUST communicate when relevant source context is unavailable.

### III. Clear Frontend-Backend Boundaries
The React/Vite frontend MUST communicate with the FastAPI backend through explicit,
documented API contracts. Backend code owns validation, persistence, document processing,
and AI orchestration; frontend code owns presentation and user interaction. Cross-layer
changes MUST preserve stable response shapes or include an intentional contract update.

### IV. Preserve Working Features
New work MUST preserve existing document uploads, document processing, AI tutor behavior,
and established study workflows unless a change explicitly requires different behavior.
Before modifying shared code, contributors MUST identify affected routes, components, and
services and verify unchanged paths with focused regression checks.

### V. Security and Privacy by Default
Uploaded documents and derived content MUST be treated as private user data. The system
MUST validate uploads, constrain file handling to intended storage locations, avoid exposing
secrets or document contents in logs and errors, and apply least-privilege access. New
features MUST document any new data collected, retained, transmitted, or exposed.

### VI. Actionable Error Handling
Errors MUST be handled at the boundary where they are understood, returned with stable
machine-readable status information, and presented to students in plain language without
leaking implementation details or sensitive data. Failures MUST leave the application in a
recoverable state and MUST be logged with enough context for diagnosis.

### VII. Testing and Verification
Every behavior change MUST have an appropriate verification step: unit tests for local
logic, API or integration tests for layer contracts, and a focused manual or end-to-end
check for user-visible workflows. Changes affecting AI, documents, or security MUST include
tests or explicit verification for their failure paths as well as their success paths.

### VIII. Maintainable, Beginner-Friendly Code
Code MUST favor small functions, descriptive names, local patterns, and straightforward
control flow. Public APIs and non-obvious decisions MUST be documented briefly. Contributors
MUST avoid speculative abstractions and unrelated refactors so that a new developer can
trace a request from the UI to the backend service without unnecessary indirection.

## Technical Boundaries

StudyGen-AI uses React with Vite and Tailwind CSS for the frontend and FastAPI with Python
for the backend. Existing AI tutor and document upload services are the default integration
points. A new framework, persistence mechanism, or AI provider MUST be justified in the
implementation plan and MUST not duplicate an existing capability without a clear reason.

Uploaded files MUST remain within the established document storage and processing flow;
temporary or derived data MUST have an explicit lifecycle. Configuration and credentials
MUST come from environment or deployment configuration, never from committed source code.

## Development Workflow

Each feature or fix MUST state its affected user workflow, API or data impact, and
verification plan. Before review, contributors MUST run the narrowest relevant tests and
checks, inspect error paths, and confirm that existing workflows still operate. Reviews
MUST check compliance with the Core Principles, especially document privacy, grounding,
frontend-backend contracts, and regression coverage.

## Governance

This constitution guides feature specifications, implementation plans, code reviews, and
verification. When a proposed change conflicts with a principle, the plan MUST record the
conflict, user or technical reason, affected risks, and an explicit mitigation. Amendments
MUST update the Sync Impact Report, version, and last-amended date, and MUST be reviewed
alongside any affected project guidance.

The constitution follows semantic versioning: MAJOR for removing or redefining a principle,
MINOR for adding or materially expanding governance, and PATCH for clarifications that do
not change obligations. Compliance is reviewed at feature planning and before release;
unresolved violations require an explicit owner and follow-up task.

**Version**: 1.0.0 | **Ratified**:2026-09-14 : confirm original adoption date | **Last Amended**: 2026-09-14
