# StudyGen-AI — Implementation Tasks

## Feature 001: Document-Aware AI Tutor

### 1. Purpose

This document breaks **Feature 001 — Document-Aware AI Tutor** into small, actionable development tasks.

The goal is to allow a student to:

```text
Upload Study Document
        ↓
Process Document
        ↓
Select Document
        ↓
Open AI Tutor
        ↓
Ask Question
        ↓
Receive Document-Grounded Answer
```

The implementation must preserve the existing StudyGen-AI technology stack and working functionality.

---

# 2. Technology Constraints

The implementation MUST continue using:

### Frontend

* React
* Vite
* JavaScript / JSX
* Tailwind CSS
* Axios

### Backend

* Python
* FastAPI
* Uvicorn

### AI

* Google Gemini API
* Existing `services/ai_service.py`

### Documents

* Existing document upload system
* PDF
* DOCX
* TXT

Do not introduce a new framework or AI provider for this feature.

---

# 3. Task Status Legend

```text
[ ] Not started
[~] In progress
[x] Completed
[!] Blocked
```

Tasks should be marked as completed only after the relevant verification has been performed.

---

# 4. Phase 0 — Preparation

## TASK-001 — Review Existing Project Structure

Status: [ ]

Review:

```text
frontend/
backend/
backend/routes/
backend/services/
backend/uploads/
```

Identify:

* Current Documents page
* Current AI Tutor page
* Current document API
* Current tutor API
* Current Gemini service
* Existing API client
* Existing environment configuration

### Verification

Confirm that the implementation plan matches the actual project structure.

---

## TASK-002 — Review Existing Document Upload

Status: [ ]

Inspect the existing document upload implementation.

Confirm:

* PDF support
* DOCX support
* TXT support
* 20 MB size limit
* File validation
* Safe generated filenames
* Document metadata
* Document listing
* Document deletion

### Verification

Upload one supported file and confirm that it appears in the document list.

---

## TASK-003 — Review Existing AI Tutor

Status: [ ]

Inspect:

```text
AITutor.jsx
routes/tutor.py
services/ai_service.py
```

Confirm:

* Existing chat behavior
* Conversation history handling
* Gemini integration
* Error handling
* Rate limiting
* Request validation
* Current API response shape

### Verification

Ask a normal general-knowledge question through the existing AI Tutor.

---

# 5. Phase 1 — Document Processing

## TASK-004 — Create Document Processing Service

Status: [ ]

Create a backend service responsible for extracting text from supported documents.

Recommended location:

```text
backend/services/document_service.py
```

The service should provide a clear interface for document text extraction.

Conceptually:

```python
extract_text(file_path)
```

### Verification

Confirm that the service can receive a supported file and return extracted text.

---

## TASK-005 — Implement PDF Text Extraction

Status: [ ]

Implement PDF text extraction using the existing project dependencies.

Requirements:

* Open the selected PDF.
* Extract text from available pages.
* Combine extracted text.
* Handle empty pages safely.
* Handle extraction errors.

### Verification

Use a text-based PDF and verify that meaningful text is extracted.

---

## TASK-006 — Implement DOCX Text Extraction

Status: [ ]

Implement DOCX text extraction using the existing project dependencies.

Requirements:

* Read document paragraphs.
* Preserve useful paragraph boundaries.
* Combine extracted text.
* Handle empty documents safely.
* Handle extraction errors.

### Verification

Use a DOCX file containing several paragraphs and confirm the extracted text.

---

## TASK-007 — Implement TXT Text Extraction

Status: [ ]

Implement TXT processing.

Requirements:

* Read the text file safely.
* Use an appropriate text encoding strategy.
* Return the document content.
* Handle empty files.

### Verification

Upload a TXT file and verify that its content can be extracted.

---

## TASK-008 — Normalize Extracted Text

Status: [ ]

Normalize extracted text before sending it to the AI service.

Possible cleanup includes:

* Removing unnecessary whitespace.
* Normalizing blank lines.
* Preserving paragraph boundaries.
* Removing obviously duplicated formatting artifacts.

Do not modify the actual meaning of the document.

### Verification

Compare the original document content with the extracted normalized content.

---

# 6. Phase 2 — Document Metadata and Processing State

## TASK-009 — Extend Document Metadata

Status: [ ]

Review the existing document metadata structure.

Where required, add processing-related information.

Potential fields:

```json
{
  "id": "...",
  "name": "...",
  "filename": "...",
  "type": "PDF",
  "size": 123456,
  "status": "Ready",
  "uploaded_at": "..."
}
```

Possible statuses:

```text
Uploaded
Processing
Ready
Failed
```

Only add fields that are required by the actual implementation.

### Verification

Upload a document and verify that its status is represented consistently.

---

## TASK-010 — Process Uploaded Document

Status: [ ]

Connect the document upload workflow with document text extraction.

Initial flow:

```text
Upload
   ↓
Validate
   ↓
Save
   ↓
Extract Text
   ↓
Mark Ready
```

If processing fails:

```text
Upload
   ↓
Processing
   ↓
Failed
```

### Verification

Upload:

* PDF
* DOCX
* TXT

and verify their processing results.

---

# 7. Phase 3 — Document Retrieval

## TASK-011 — Create Document Lookup Function

Status: [ ]

Create a backend function for locating a document by its document ID.

The function should:

* Accept a document ID.
* Locate the corresponding metadata.
* Resolve the stored file safely.
* Return an appropriate result when the document does not exist.

### Verification

Test:

```text
Valid document ID
Invalid document ID
Deleted document ID
```

---

## TASK-012 — Add Document Text Retrieval

Status: [ ]

Create a backend service function that returns the extracted text for a selected document.

Conceptually:

```python
get_document_text(document_id)
```

The implementation should not expose the physical storage path to the frontend.

### Verification

Request text for a valid document and confirm that the expected document content is returned internally.

---

# 8. Phase 4 — Document-Aware Tutor API

## TASK-013 — Extend Tutor Request Model

Status: [ ]

Extend the tutor request model to support a selected document.

Conceptually:

```json
{
  "question": "Explain binary trees.",
  "document_id": "document-uuid"
}
```

The existing general AI Tutor behavior should remain supported where appropriate.

### Verification

Test requests with:

```text
Question only
Question + valid document_id
Question + invalid document_id
```

---

## TASK-014 — Validate Selected Document

Status: [ ]

When `document_id` is supplied:

1. Validate the ID.
2. Find the document.
3. Confirm that it exists.
4. Obtain its extracted content.
5. Continue only if the document is available.

If it cannot be found, return a stable API error.

Example:

```text
DOCUMENT_NOT_FOUND
```

### Verification

Delete a document and then attempt to ask the tutor using its ID.

---

## TASK-015 — Add Document Context to AI Service

Status: [ ]

Extend the existing AI service so it can optionally receive document context.

Conceptually:

```python
ask_gemini(
    question=question,
    history=history,
    document_context=document_text
)
```

Do not create a second Gemini client.

Reuse the existing Gemini configuration.

### Verification

Confirm that a document-aware request reaches the existing Gemini service.

---

# 9. Phase 5 — Grounded AI Prompt

## TASK-016 — Create Document-Aware System Instructions

Status: [ ]

Extend the existing StudyGen AI Tutor instructions with document-grounding behavior.

The AI should be instructed to:

* Use supplied document context when answering document-specific questions.
* Distinguish document information from general knowledge.
* Avoid claiming unsupported information came from the document.
* State when the document does not contain enough information.
* Remain educational and student-friendly.

The existing tutor persona and behavior should be preserved.

### Verification

Ask a question whose answer exists in the document.

---

## TASK-017 — Handle Unsupported Questions

Status: [ ]

Test questions that are not supported by the selected document.

The AI should not fabricate document-specific evidence.

Example behavior:

```text
The selected document does not provide enough
information to answer this question directly.
```

The exact wording may be generated by the AI.

### Verification

Ask a question about a topic that is clearly absent from the document.

---

## TASK-018 — Prevent Unnecessary Document Context

Status: [ ]

Ensure that document context is only included when appropriate.

Do not unnecessarily attach large document content to unrelated requests.

### Verification

Compare:

```text
General Tutor Question
```

with:

```text
Document-Specific Question
```

and confirm the backend handles them appropriately.

---

# 10. Phase 6 — Frontend Document Selection

## TASK-019 — Add Document Selection UI

Status: [ ]

Update the existing `Documents.jsx` page to allow a student to select a document for the AI Tutor.

Possible action:

```text
[ Use with AI Tutor ]
```

The UI should clearly indicate the selected document.

### Verification

Select a document and confirm that the frontend records the selection.

---

## TASK-020 — Connect Document Selection to AI Tutor

Status: [ ]

Pass the selected document information into the AI Tutor workflow.

The selected document should be available when the student navigates to the AI Tutor.

Use the existing frontend architecture.

Do not introduce a new state-management library.

### Verification

Select:

```text
Data Structures Notes.pdf
```

Navigate to AI Tutor and verify that the tutor knows which document is active.

---

# 11. Phase 7 — AI Tutor UI

## TASK-021 — Display Active Document

Status: [ ]

Update the existing AI Tutor UI to display the active document.

Example:

```text
Using:
📄 Data Structures Notes.pdf
```

### Verification

Select different documents and confirm that the displayed document changes correctly.

---

## TASK-022 — Send Document ID with Question

Status: [ ]

Update the existing AI Tutor request so the selected document ID is included when document-aware mode is active.

Example:

```json
{
  "question": "Explain binary trees.",
  "document_id": "..."
}
```

### Verification

Inspect the browser request and confirm that the correct document ID is sent.

---

## TASK-023 — Preserve Existing Chat History

Status: [ ]

Ensure the existing conversation history behavior continues working.

The new document context must not unnecessarily duplicate chat messages.

### Verification

Ask multiple questions in sequence:

```text
What is a binary tree?

Explain it more simply.

Give me an example.
```

Confirm that the conversation remains coherent.

---

# 12. Phase 8 — Loading and Error States

## TASK-024 — Add Document Processing Feedback

Status: [ ]

Display appropriate document processing states.

Possible states:

```text
Uploading...
Processing...
Ready
Failed
```

Do not display internal implementation details.

---

## TASK-025 — Add Tutor Loading State

Status: [ ]

Preserve or improve the existing AI Tutor loading state.

The student should clearly know when the AI is processing a question.

### Verification

Ask a question and verify that a loading indicator appears until the response arrives.

---

## TASK-026 — Handle Document Errors

Status: [ ]

Handle:

* Document not found
* Document processing failure
* Unsupported file
* Oversized file
* Empty document

The UI should display a useful message and remain usable.

---

## TASK-027 — Handle AI Errors

Status: [ ]

Preserve the existing safe AI error handling.

Do not expose:

* Gemini API errors
* API keys
* Stack traces
* Internal Python exceptions

Example:

```text
The AI service is temporarily unavailable.
Please try again.
```

---

# 13. Phase 9 — Document Deletion Integration

## TASK-028 — Handle Deletion of Active Document

Status: [ ]

If the currently selected document is deleted:

```text
Delete Document
      ↓
Clear Selected Document
      ↓
Update AI Tutor
```

The tutor must not continue sending requests using the deleted document ID.

### Verification

1. Select a document.
2. Open AI Tutor.
3. Delete the document.
4. Return to AI Tutor.
5. Confirm the selected document is no longer active.

---

# 14. Phase 10 — Security

## TASK-029 — Verify File Validation

Status: [ ]

Verify:

* Extension validation
* Content-type validation
* 20 MB limit
* Safe generated filename
* Controlled storage directory

---

## TASK-030 — Verify Secret Handling

Status: [ ]

Confirm:

* Gemini API key exists only in backend environment configuration.
* `.env` is ignored by Git.
* `.env.example` contains placeholders only.
* No secrets are present in frontend source code.

---

## TASK-031 — Verify Error Privacy

Status: [ ]

Check that errors do not expose:

* Server paths
* API keys
* Full document content
* Stack traces
* Internal service details

---

# 15. Phase 11 — Testing

## TASK-032 — Test PDF Processing

Status: [ ]

Test:

```text
Normal PDF
Empty PDF
Large PDF
Invalid PDF
```

Verify expected success and failure behavior.

---

## TASK-033 — Test DOCX Processing

Status: [ ]

Test:

```text
Normal DOCX
Empty DOCX
Invalid DOCX
```

---

## TASK-034 — Test TXT Processing

Status: [ ]

Test:

```text
Normal TXT
Empty TXT
Unsupported encoding scenario
```

---

## TASK-035 — Test Document-Aware Questions

Status: [ ]

Test questions where the answer exists in the selected document.

Example:

```text
What is a stack according to this document?
```

Verify that the response uses the document context.

---

## TASK-036 — Test Unsupported Document Questions

Status: [ ]

Ask questions about information not contained in the selected document.

Verify that the AI does not falsely attribute the answer to the document.

---

## TASK-037 — Test Conversation Follow-Ups

Status: [ ]

Verify:

```text
Question
   ↓
Answer
   ↓
Follow-up
   ↓
Answer using conversation context
```

---

## TASK-038 — Test Document Switching

Status: [ ]

Test:

```text
Document A selected
   ↓
Ask question
   ↓
Switch to Document B
   ↓
Ask another question
```

Confirm that the correct document is used for each request.

---

## TASK-039 — Test Deleted Document

Status: [ ]

Attempt to use a deleted document.

Expected result:

```text
Document unavailable
```

The application must recover without crashing.

---

# 16. Phase 12 — Regression Testing

## TASK-040 — Verify Existing AI Tutor

Status: [ ]

Confirm normal AI Tutor functionality remains operational.

Test:

```text
General question
Follow-up question
Longer question
Invalid/empty input
AI failure
```

---

## TASK-041 — Verify Existing Documents Page

Status: [ ]

Confirm:

```text
Upload
List
Delete
Search
UI rendering
```

continue working.

---

## TASK-042 — Verify Frontend Navigation

Status: [ ]

Verify navigation between:

```text
Dashboard
Documents
AI Tutor
Quizzes
Flashcards
Progress
```

---

## TASK-043 — Verify Backend Startup

Status: [ ]

Confirm:

```text
uvicorn main:app --reload
```

starts successfully.

Verify:

```text
GET /
GET /health
```

return expected responses.

---

# 17. Phase 13 — Code Quality

## TASK-044 — Remove Debug Code

Status: [ ]

Remove unnecessary:

```text
console.log
print()
temporary debugging code
unused imports
unused variables
```

Keep useful backend error logging.

---

## TASK-045 — Review API Contracts

Status: [ ]

Verify that frontend and backend request/response structures match.

Check:

```text
Documents API
Tutor API
Document selection
Error responses
```

---

## TASK-046 — Review Code Against RULES.md

Status: [ ]

Confirm implementation follows:

```text
RULES.md
ARCHITECTURE.md
DESIGN.md
Constitution
```

---

# 18. Phase 14 — Documentation

## TASK-047 — Update Architecture Documentation

Status: [ ]

Update `ARCHITECTURE.md` if implementation details differ from the planned architecture.

Documentation must describe the actual implementation.

---

## TASK-048 — Record Architectural Decisions

Status: [ ]

Add significant technical decisions to:

```text
DECISIONS.md
```

Examples:

* Why existing Gemini service was reused.
* Why a vector database was not introduced.
* Why document processing occurs on the backend.

---

## TASK-049 — Update Test Plan

Status: [ ]

Record final verification procedures in:

```text
TEST_PLAN.md
```

---

# 19. Phase 15 — Final Verification

## TASK-050 — Complete End-to-End Workflow

Status: [ ]

Perform the complete user workflow:

```text
1. Start backend.
2. Start frontend.
3. Open Documents.
4. Upload PDF.
5. Wait for processing.
6. Confirm document is ready.
7. Select document.
8. Open AI Tutor.
9. Confirm active document.
10. Ask a document-specific question.
11. Verify answer.
12. Ask a follow-up.
13. Switch document.
14. Ask another question.
15. Delete a document.
16. Verify deleted document cannot be used.
```

---

# 20. Definition of Done

Feature 001 is complete only when:

```text
[x] Specification exists
[ ] Architecture implemented
[ ] Document processing works
[ ] Document selection works
[ ] AI Tutor accepts document context
[ ] Gemini receives appropriate context
[ ] Responses are document-grounded
[ ] Error states work
[ ] Security checks pass
[ ] Existing features still work
[ ] Tests pass
[ ] Manual workflow verified
[ ] Documentation updated
```

---

# 21. Recommended Implementation Order

AI agents should implement the feature in this order:

```text
1. Review existing code
        ↓
2. Document processing service
        ↓
3. PDF extraction
        ↓
4. DOCX extraction
        ↓
5. TXT extraction
        ↓
6. Document processing integration
        ↓
7. Document lookup
        ↓
8. Tutor API extension
        ↓
9. AI service document context
        ↓
10. Grounding instructions
        ↓
11. Frontend document selection
        ↓
12. AI Tutor integration
        ↓
13. Loading/error states
        ↓
14. Security verification
        ↓
15. Tests
        ↓
16. Regression testing
        ↓
17. Documentation
        ↓
18. End-to-end verification
```

The implementation should proceed incrementally. After each major phase, verify that existing functionality still works.

---

# 22. Important Implementation Rule

Do not implement all tasks in one large code-generation step.

Each task should be:

```text
Understand
   ↓
Modify
   ↓
Run
   ↓
Verify
   ↓
Continue
```

This reduces the risk of breaking the existing StudyGen-AI project and makes failures easier to identify.

---

# 23. Final Feature Goal

The completed feature should provide this experience:

```text
                 STUDENT
                    |
                    v
             Upload Document
                    |
                    v
             Process Document
                    |
                    v
             Select Document
                    |
                    v
               AI Tutor
                    |
                    v
              Ask Question
                    |
                    v
        Document-Aware AI Response
                    |
                    v
             Continue Learning
```

The goal is not simply to make Gemini answer questions.

The goal is to make **StudyGen-AI understand and use a student's uploaded study material as the context for learning.**
