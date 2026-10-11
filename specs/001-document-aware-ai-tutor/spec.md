# Feature Specification: Document-Aware AI Tutor

**Feature Branch**: `001-document-aware-ai-tutor`

**Created**: 2026-09-14

**Status**: Partially implemented; acceptance and success criteria are not fully verified.

**Input**: User description: "Build Feature 001: Document-Aware AI Tutor for StudyGen-AI. Allow a student to select an uploaded PDF, DOCX, or TXT study document, ask questions about its content, receive grounded answers or a clear not-found message, continue with follow-up questions, and preserve existing uploads and StudyGen-AI functionality."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ask About a Selected Document (Priority: P1)

A student opens their document library, selects an uploaded study document, chooses **Ask AI**, and is taken to the AI Tutor with that document selected. The student asks a question and receives an answer based on the selected document. The conversation clearly identifies the document used.

**Why this priority**: This is the core value of the feature: turning an uploaded study material into a useful, contextual tutor conversation.

**Independent Test**: Start with one successfully processed document, select it, ask a question whose answer appears in the document, and verify that the answer is returned and the selected document is identified.

**Acceptance Scenarios**:

1. **Given** a listed document with a stable document ID and usable processed content, **When** the student selects **Ask AI**, **Then** the AI Tutor opens with that document selected and the document name is visible.
2. **Given** a selected usable document, **When** the student submits a non-empty question, **Then** the response uses the selected document content and the response identifies the document used.
3. **Given** a selected document and an existing tutor conversation, **When** the student asks a follow-up question, **Then** the selected document remains associated with the conversation unless the student changes or clears it.
4. **Given** a selected usable document that does not contain information relevant to the question, **When** the student submits the question, **Then** the tutor clearly states that the answer was not found in the selected document and does not present unrelated information as document-grounded.

---

### User Story 2 - Understand Document Availability (Priority: P2)

A student can tell whether a document is ready for questions and receives clear feedback while the document or answer is loading. The student is not led to believe that an answer was grounded in a document when the content cannot be used.

**Why this priority**: Clear state and source feedback prevents misleading study guidance and makes the workflow understandable for beginners.

**Independent Test**: Exercise ready, loading, empty, and unavailable-document states and verify that each state provides an understandable next step without displaying a fabricated document-grounded answer.

**Acceptance Scenarios**:

1. **Given** a document that is still processing, **When** the student tries to ask AI about it, **Then** the system prevents or defers the question and explains that the document is not ready.
2. **Given** a selected document whose content cannot be retrieved, **When** the student submits a question, **Then** the system shows a clear failure message and does not claim that the answer used the document.
3. **Given** no uploaded documents, **When** the student opens the Documents page, **Then** the empty state explains that a document must be uploaded before document-based questions can be asked.

---

### User Story 3 - Recover From Invalid or Deleted Documents (Priority: P2)

A student can recover when a previously selected document is missing, invalid, deleted, or no longer processed. The student can return to the document library or continue using the general AI Tutor without a broken page or stale selection.

**Why this priority**: Documents can change between selection and question submission; recovery protects existing tutor use and avoids confusing dead ends.

**Independent Test**: Select a document, make it unavailable before submitting a question, and verify the system rejects the grounded request safely while keeping navigation and general tutor use available.

**Acceptance Scenarios**:

1. **Given** a selected document that has been deleted, **When** the student submits a question, **Then** the system reports that the document is unavailable, clears or invalidates the selection, and does not generate a document-grounded answer.
2. **Given** an invalid document ID in a navigation or question request, **When** the AI Tutor loads or the question is submitted, **Then** the system rejects the selection with a clear recoverable message.
3. **Given** a document-grounded request fails, **When** the student dismisses the error or selects another document, **Then** the AI Tutor remains usable and the existing general tutor workflow is not blocked.

---

### User Story 4 - Continue Existing Document and Tutor Workflows (Priority: P3)

A student can continue uploading, listing, deleting, and using documents as before, and can use the AI Tutor without selecting a document when they want a general study question.

**Why this priority**: The feature is an extension of existing StudyGen behavior and must not regress trusted workflows.

**Independent Test**: Run the existing upload, list, delete, and general tutor checks before and after enabling document-aware questions and verify their outcomes remain unchanged.

**Acceptance Scenarios**:

1. **Given** a valid PDF, DOCX, or TXT upload, **When** the student uploads it, **Then** the document continues through the existing upload and processing workflow and appears in the document list with its metadata.
2. **Given** a listed document, **When** the student deletes it, **Then** it is removed as before and cannot remain usable as a document-grounded source.
3. **Given** no document selection, **When** the student asks a general tutor question, **Then** the existing AI Tutor behavior remains available without requiring a document.

### Edge Cases

- A document ID is missing, malformed, or does not match any listed document.
- A document is deleted after selection but before content retrieval or answer generation.
- A document reports processing failure, is still processing, or is marked processed while its content file is missing or empty.
- A valid document contains no readable text or contains text that is insufficient to answer the question.
- A question is valid but unsupported by the selected document's content; the system must distinguish “not found in this document” from a service or validation failure.
- The student submits an empty or whitespace-only question, or a question longer than the existing tutor limit.
- The selected document changes while a question is loading; the displayed answer and source indicator must remain associated with the request that produced them.
- The document content service or AI service is unavailable, times out, returns an empty answer, or returns a non-success response.
- The selected document contains sensitive content; errors and status messages must not expose its contents.
- The document list is empty, cannot load, or becomes stale after deletion.
- The student refreshes or directly opens the AI Tutor with an invalid or expired document selection.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow a student to initiate a document-grounded tutor session from a document listed in the Documents page.
- **FR-002**: The system MUST identify the selected document using its existing document ID and MUST pass that identifier through the document-grounded question flow without substituting only a display name or filename.
- **FR-003**: The AI Tutor MUST show which document is selected for the active document-grounded conversation, including a clear document name or equivalent metadata.
- **FR-004**: The system MUST verify that the selected document exists and is eligible for use before attempting to answer a document-grounded question.
- **FR-005**: The system MUST use the selected document's available processed content when generating a document-grounded answer.
- **FR-006**: The system MUST make readable extracted text from supported PDF, DOCX, and TXT documents available as the study context only after successful processing.
- **FR-007**: When the selected document does not contain an answer, the tutor MUST clearly state that the answer was not found in that document and MUST NOT present unrelated information as though it came from the document.
- **FR-008**: The system MUST NOT claim or imply that a response used a document when the document ID is invalid, the document is missing or deleted, processing is incomplete, content retrieval fails, or usable content is unavailable.
- **FR-009**: When a document cannot be used, the system MUST provide a clear, actionable message that explains the document state and indicates whether the student should wait, choose another document, upload a document, or retry.
- **FR-010**: The system MUST handle loading, ready, empty, success, not-found, and failure states for document selection, content retrieval, and answer generation.
- **FR-011**: The system MUST support follow-up questions in the same selected-document conversation while preserving the existing conversation history behavior.
- **FR-012**: The system MUST allow the student to clear the selected document or return to general AI Tutor behavior without a document.
- **FR-013**: The system MUST reject empty questions using the existing tutor validation behavior and MUST preserve applicable question length and rate-limit protections.
- **FR-014**: The system MUST preserve existing document upload, processing, listing, metadata display, and deletion behavior.
- **FR-015**: The system MUST preserve existing general AI Tutor behavior when no document is selected.
- **FR-016**: The system MUST prevent a deleted or unavailable document from being used by a stale selection and MUST provide a recoverable path to select another document.
- **FR-017**: The system MUST keep document contents private by avoiding document text in user-facing errors, diagnostic output, or unrelated responses.
- **FR-018**: The system MUST expose enough stable success and failure information for the frontend to distinguish a grounded answer, a not-found-in-document answer, an unavailable document, an invalid request, and a temporary service failure.
- **FR-019**: Verification MUST cover document processing, at least one successful question answered from document content, a question unsupported by that content, and unsuccessful requests for missing, invalid, deleted, unprocessed, empty, and content-unavailable documents.
- **FR-020**: Document-aware answers MUST treat supplied extracted text as primary evidence, distinguish proposed/planned features from implementation claims, identify conflicting statements, and avoid presenting unsupported assumptions as document facts.
- **FR-021**: The system MUST tell the model and user when only an excerpt is supplied, MUST disclose that unseen extracted text was not examined, and MUST NOT claim that the complete document was reviewed in that case.
- **FR-022**: References to document sections or pages MUST only be provided when they can be reliably derived from supplied text; any helpful outside knowledge MUST be labeled separately from document evidence.
- **FR-023**: Document content MUST remain untrusted input and MUST NOT override tutor instructions. Prompt guidance is a mitigation, not a guarantee of prompt-injection resistance.

### Key Entities *(include if feature involves data)*

- **Document**: An uploaded study material identified by its existing ID and associated metadata such as name, filename, type, size, upload date, processing status, and content availability.
- **Document Selection**: The document ID and display metadata associated with the active AI Tutor conversation; it may be cleared or invalidated when the document is unavailable.
- **Tutor Question**: A student's question, optional conversation history, and optional selected document ID.
- **Tutor Answer**: The AI response, its completion state, and the document source indicator when the response was successfully grounded.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In verification with a readable processed document, at least 95% of valid document-grounded questions return an answer that includes the correct selected document indicator within 10 seconds under normal service conditions.
- **SC-002**: In verification, 100% of requests using missing, invalid, deleted, unprocessed, empty, or unavailable document content are rejected or reported without presenting the response as document-grounded.
- **SC-003**: In verification, 100% of questions whose answers are absent from the selected document receive a clear not-found-in-document response without unrelated claims presented as sourced from that document.
- **SC-004**: At least 90% of first-time student testers can complete the flow from document selection to a document-grounded question without assistance.
- **SC-005**: Existing document upload, listing, deletion, and general AI Tutor regression checks pass with no behavior change attributable to this feature.
- **SC-006**: Every loading, empty, success, not-found, and failure state in the document-grounded flow provides visible status or next-step guidance, with no blank or indefinitely blocked state during verification.
- **SC-007**: A student can identify the source document for every successful document-grounded answer without opening developer tools or inspecting a request.

## Assumptions

- The existing document upload system remains the source of truth for document IDs, metadata, processing status, and extracted content.
- PDF, DOCX, and TXT documents remain the supported upload types for this feature.
- Existing authentication or user/session scoping, if present elsewhere in the application, continues to protect access to documents; this feature does not introduce a new identity system.
- The existing AI Tutor remains available for general questions and continues to support conversation history and streaming or incremental responses where already supported.
- Document-grounded answers are limited to content that can be retrieved from the selected document; the system may state that the answer is not found rather than infer unsupported document facts.
- No new framework or database is required for the feature; any change to existing storage or service boundaries must be justified during planning.
- The first version supports one active selected document per tutor conversation; multi-document comparison is out of scope.
- Document content is processed before it becomes eligible for document-grounded questions; processing failures remain visible as unavailable states.

## Implementation Evidence (2026-10-11)

This section records repository evidence without changing the requirements or treating the feature as complete.

### Implemented evidence

- The Documents page links a processed document to `/ai-tutor?document_id=...`; the Tutor page loads the document metadata and includes the selected ID in tutor requests.
- The backend validates document availability and processed text before starting a document-aware response stream.
- Document-aware requests require a valid session, CSRF token, and a database query scoped to the authenticated owner before the extracted text is read.
- The backend passes up to the first 12,000 extracted characters to the AI service. Prompt construction distinguishes complete extracted text from a partial excerpt, and additive SSE start metadata reports truncation plus supplied/total character counts. The frontend shows a notice when later extracted text was not sent.
- System instructions tell the model to prioritize document evidence, distinguish proposed/planned features from established implementation claims, identify contradictions, avoid unsupported claims and unreliable section/page references, separate useful general knowledge, and treat document content as untrusted. These are prompt mitigations and do not guarantee model compliance.
- Tutor responses are delivered as SSE events. General tutor requests remain possible without a document ID.
- Backend `unittest` coverage uses mocked provider output to exercise document-evidence pass-through for supported facts, proposed and unverified features, contradictory statements, missing information, excerpt-limited questions, and prompt-injection-like text. It also checks SSE context metadata, streaming, context bounds, ownership denial, guest/general requests, and selected-document failure states.

### Incomplete or unverified requirements

- No live Gemini request or browser end-to-end test was run. Tests mock provider responses and establish prompt/request/stream plumbing, not actual model answer quality, factual grounding, contradiction detection, proposed-versus-implemented classification, or resistance to prompt injection.
- The UI displays the selected document and warns about partial context, but answers have no separately persisted or verified citation/source record. Context is the first excerpt, not retrieval across the full document; relevant passages after the boundary can be missed.
- Upload/extraction format edge cases, MIME spoofing, file-size boundary behavior, loading/empty UI states, accessibility, and all specified success-criterion thresholds remain unverified.
- No embeddings, chunking, retrieval ranking, source-location tracking, or citation validation are implemented. Prompt-injection wording does not guarantee isolation against malicious document content.

The specification's acceptance scenarios and success criteria remain targets until each is independently verified. See [`docs/FEATURES.md`](../../docs/FEATURES.md) and [`docs/TESTING.md`](../../docs/TESTING.md) for the current inventory and test scope.
