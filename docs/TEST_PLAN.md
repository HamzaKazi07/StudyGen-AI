# StudyGen-AI — Test Plan

## 1. Purpose

This document defines the testing and verification strategy for **StudyGen-AI**.

The primary objective is to verify that:

* Existing StudyGen functionality continues to work.
* Documents can be uploaded safely.
* Supported documents can be processed correctly.
* Document content can be used by the AI Tutor.
* AI responses remain grounded in the selected document when appropriate.
* Errors are handled safely.
* Invalid or oversized files are rejected.
* AI service failures do not expose internal implementation details.
* New functionality does not introduce regressions.

---

# 2. Testing Scope

Testing covers the following areas:

```text
Frontend
Backend
API Contracts
Document Upload
Document Processing
Document Selection
AI Tutor
Document-Aware AI
Security
Error Handling
Rate Limiting
Regression
```

The main feature under test is:

> **Feature 001 — Document-Aware AI Tutor**

---

# 3. Testing Strategy

StudyGen should use multiple levels of testing.

```text
                    Testing
                       |
        ┌──────────────┼──────────────┐
        ↓              ↓              ↓
      Unit           API          End-to-End
        |              |              |
     Local logic   Contracts     User workflow
```

Testing should remain proportional to the feature.

Small local functions should have focused unit tests.

API behavior should have API/integration tests.

User-visible workflows should have manual or end-to-end verification.

---

# 4. Existing Functionality to Protect

Before implementing Document-Aware AI Tutor, verify that these existing features continue working:

```text
[x] Frontend starts
[x] Backend starts
[x] Dashboard loads
[x] Documents page loads
[x] Document upload works
[x] Document listing works
[x] Document deletion works
[x] AI Tutor loads
[x] AI Tutor can answer general questions
[x] AI Tutor conversation history works
[x] AI Tutor rate limiting works
```

New functionality must not break these workflows.

---

# 5. Test Environment

## Frontend

Expected development environment:

```text
React
Vite
Tailwind CSS
Node.js
```

Frontend development server:

```text
http://localhost:5173
```

---

## Backend

Expected development environment:

```text
Python
FastAPI
Uvicorn
```

Backend development server:

```text
http://localhost:8000
```

---

## AI Provider

StudyGen currently uses:

```text
Google Gemini API
```

The Gemini API key must be supplied through environment configuration.

---

# 6. Backend Startup Test

## Test

Start the backend.

Example:

```powershell
python -m uvicorn main:app --reload
```

## Expected Result

The server starts successfully without import or configuration errors.

Expected API:

```text
http://localhost:8000
```

---

# 7. Health Check Test

## Endpoint

```text
GET /health
```

## Expected Response

```json
{
  "status": "ok"
}
```

## Pass Criteria

The endpoint returns HTTP `200`.

---

# 8. Root Endpoint Test

## Endpoint

```text
GET /
```

## Expected Result

The API responds with the StudyGen API status message.

## Pass Criteria

HTTP `200`.

---

# 9. Document Upload Tests

## 9.1 Valid PDF Upload

### Input

A valid PDF file smaller than 20 MB.

### Expected

```text
HTTP 200
success = true
document metadata returned
```

The document should appear in the Documents page.

---

## 9.2 Valid DOCX Upload

### Input

A valid DOCX file smaller than 20 MB.

### Expected

The upload succeeds and document metadata is returned.

---

## 9.3 Valid TXT Upload

### Input

A valid TXT file smaller than 20 MB.

### Expected

The upload succeeds.

---

# 10. Invalid Extension Test

## Input

Attempt to upload an unsupported file such as:

```text
.exe
.zip
.jpg
.png
.mp4
```

## Expected

The API rejects the file.

Expected status:

```text
400
```

Expected behavior:

```text
No file is stored.
```

---

# 11. Invalid Content-Type Test

A file with a mismatched or unsupported content type should be rejected.

## Expected

```text
HTTP 400
```

No invalid document should be added to the document library.

---

# 12. Empty Filename Test

## Input

Attempt to submit a file without a valid filename.

## Expected

```text
HTTP 400
```

The backend should not create a document record.

---

# 13. Maximum File Size Test

## Input

Upload a file larger than:

```text
20 MB
```

## Expected

```text
HTTP 413
```

The oversized file must not remain in the upload directory.

---

# 14. Boundary File Size Test

Test files around the limit:

```text
19 MB
19.9 MB
20 MB
20.1 MB
```

## Expected

Files within the configured limit should be accepted.

Files exceeding the configured limit should be rejected.

---

# 15. Safe Filename Test

Upload files with filenames containing characters such as:

```text
my notes.pdf
AI & ML notes.pdf
../../test.pdf
notes<>.pdf
```

## Expected

The backend should store the file using its generated safe filename.

The original filename may remain as metadata, but it must not become the physical storage path.

---

# 16. Document Listing Test

## Endpoint

```text
GET /api/documents
```

## Expected

Uploaded documents appear in the response.

Example:

```json
{
  "success": true,
  "documents": []
}
```

The response must remain a predictable structure.

---

# 17. Document Deletion Test

## Endpoint

```text
DELETE /api/documents/{document_id}
```

## Expected

The selected document is removed.

The corresponding stored file should also be removed.

---

# 18. Delete Unknown Document Test

Attempt to delete a document ID that does not exist.

## Expected

```text
HTTP 404
```

The response should contain a safe document-not-found message.

---

# 19. Document Processing Tests

Feature 001 requires document processing.

Each supported format should be tested separately.

---

## 19.1 PDF Text Extraction

### Input

A PDF containing known text.

Example:

```text
Machine Learning is a branch of Artificial Intelligence.
```

### Expected

The processing service extracts the readable text.

The extracted content should contain the known sentence.

---

## 19.2 DOCX Text Extraction

### Input

A DOCX containing:

```text
Supervised learning uses labeled training data.
```

### Expected

The processing service extracts the text correctly.

---

## 19.3 TXT Text Extraction

### Input

A TXT file containing known text.

### Expected

The exact text should be available to the processing pipeline.

---

# 20. Empty Document Test

Upload a valid document containing no meaningful text.

## Expected

The processing system should detect that usable content is unavailable.

The document should not be treated as successfully processed if no usable content can be extracted.

---

# 21. Corrupted Document Test

Upload a corrupted or invalid PDF/DOCX file.

## Expected

The processing operation fails safely.

The application should:

* Avoid crashing.
* Mark processing as failed where supported.
* Return a safe error.
* Avoid exposing stack traces.

---

# 22. Document Processing State Test

The document lifecycle should support states similar to:

```text
Uploaded
Processing
Ready
Failed
```

## Expected Flow

```text
Upload
   ↓
Uploaded
   ↓
Processing
   ↓
Ready
```

Failure:

```text
Upload
   ↓
Uploaded
   ↓
Processing
   ↓
Failed
```

---

# 23. Document Selection Test

The Documents page should allow the student to select a processed document for AI Tutor use.

## Expected

The selected document should have a stable identifier.

Example:

```json
{
  "document_id": "uuid"
}
```

The frontend should not depend on the physical storage filename.

---

# 24. General AI Tutor Regression Test

Ask the AI Tutor a question without selecting a document.

Example:

```text
What is polymorphism?
```

## Expected

The AI Tutor continues to answer normally.

Document-aware functionality must not break general AI Tutor behavior.

---

# 25. Document-Aware Tutor Test

## Setup

Upload a document containing:

```text
Machine Learning is a method where computers learn patterns
from data to make predictions or decisions.
```

Select the document.

## Question

```text
What is Machine Learning according to this document?
```

## Expected

The answer should be based on the uploaded document.

The AI should not falsely claim information that is absent from the document.

---

# 26. Document Context Test

Create a document containing a unique fact.

Example:

```text
The StudyGen testing system uses the fictional algorithm
named BlueLearn-42.
```

Ask:

```text
What algorithm is mentioned in the document?
```

## Expected

The tutor should identify:

```text
BlueLearn-42
```

This verifies that the selected document context is actually reaching the AI service.

---

# 27. Document Absence Test

Create a document that does not mention a requested topic.

Example document:

```text
This document discusses supervised learning.
```

Question:

```text
Explain reinforcement learning according to this document.
```

## Expected

The tutor should communicate that the selected document does not contain enough information.

It should not pretend that the document contains an explanation.

---

# 28. Document vs General Knowledge Test

Document:

```text
The document states that Python was created by Example Person.
```

Question:

```text
Who created Python according to this document?
```

## Expected

The tutor should clearly answer according to the document rather than silently replacing the document's statement with unrelated external knowledge.

The response should make the source context clear where necessary.

---

# 29. Follow-Up Question Test

Example conversation:

```text
Student:
What is supervised learning according to this document?

Tutor:
...

Student:
Explain it more simply.
```

## Expected

The tutor understands that:

```text
"it"
```

refers to the previous topic.

Conversation history must continue working alongside document context.

---

# 30. Document Context + Conversation History Test

Test:

```text
Document selected:
Machine Learning Notes

Question 1:
What is supervised learning?

Question 2:
Give me an example of it.

Question 3:
Explain that example in simpler words.
```

## Expected

The tutor should maintain both:

```text
Document Context
+
Conversation Context
```

---

# 31. Document Switching Test

Upload two documents:

```text
Document A
Document B
```

Document A contains:

```text
Topic = Neural Networks
```

Document B contains:

```text
Topic = Decision Trees
```

Ask the same question while switching documents.

## Expected

The tutor should use the currently selected document.

Document A should not leak into Document B's context.

---

# 32. Deleted Document Test

Select a document and then delete it.

Attempt to ask the tutor using the deleted document ID.

## Expected

The backend should return:

```text
404
```

or another documented safe response.

The tutor must not use unavailable document content.

---

# 33. Document Not Found Test

Send a tutor request containing an invalid document ID.

Example:

```text
document_id = "does-not-exist"
```

## Expected

The backend should return a stable document-not-found response.

---

# 34. Empty Question Test

Send:

```text
""
```

or whitespace-only input.

## Expected

The request is rejected.

Expected status:

```text
400
```

---

# 35. Maximum Question Length Test

The current tutor request has a maximum question length.

Test:

```text
valid question
question exactly at limit
question above limit
```

## Expected

Questions within the limit are accepted.

Questions exceeding the limit are rejected.

---

# 36. Rate Limit Test

The current tutor configuration allows:

```text
20 requests
per 60 seconds
per client IP
```

Send requests beyond the configured limit.

## Expected

The backend eventually returns:

```text
429
```

Expected safe message:

```text
Too many requests. Please wait a moment and try again.
```

---

# 37. Gemini Failure Test

Temporarily simulate an AI provider failure.

## Expected

The backend should:

* Catch the exception.
* Log useful diagnostic information server-side.
* Return a safe API response.
* Avoid exposing the raw exception to the frontend.

Expected status:

```text
502
```

---

# 38. Missing Gemini API Key Test

Start the backend without:

```text
GEMINI_API_KEY
```

## Expected

The application should fail clearly during configuration rather than silently operating with an invalid AI configuration.

The API key must never appear in source code.

---

# 39. Frontend Upload Test

Open:

```text
Documents
```

Click:

```text
+ Upload Document
```

Select a supported file.

## Expected

The document uploads successfully.

The UI should update without requiring a full page refresh where supported by the implementation.

---

# 40. Frontend Invalid Upload Test

Attempt to upload an unsupported file.

## Expected

The frontend displays a clear error message.

The browser should not appear to have successfully uploaded the invalid file.

---

# 41. Frontend Loading State Test

During document upload or processing:

## Expected

The UI should communicate that an operation is in progress.

The user should not be left wondering whether the action worked.

---

# 42. Frontend Empty State Test

When no documents exist:

## Expected

The Documents page should display a useful empty state.

It should guide the student toward uploading their first document.

---

# 43. Frontend Error State Test

If document processing fails:

## Expected

The UI should display a human-readable error.

It should not show:

```text
Python traceback
File paths
API keys
Internal exception objects
```

---

# 44. AI Tutor Loading State

While waiting for Gemini:

## Expected

The AI Tutor should display a loading state.

The user should receive clear feedback that the request is being processed.

---

# 45. AI Tutor Failure State

When the backend returns a `502`, `429`, `400`, or document-related error:

## Expected

The frontend should display a clear message appropriate to the error.

The raw backend exception should not be displayed.

---

# 46. API Contract Tests

Frontend and backend request/response structures must remain synchronized.

Important contracts include:

```text
POST /api/tutor/ask

POST /api/documents/upload

GET /api/documents

DELETE /api/documents/{document_id}
```

If the Document-Aware Tutor adds:

```text
document_id
```

the frontend and backend must both use the same field name and expected type.

---

# 47. Security Tests

Security verification must include:

```text
[ ] API key not exposed in frontend
[ ] .env not committed
[ ] .env.example contains placeholders only
[ ] Unsupported file types rejected
[ ] Oversized files rejected
[ ] Unsafe storage filenames prevented
[ ] Internal errors hidden from users
[ ] Document paths not exposed
[ ] Document content not unnecessarily logged
[ ] Rate limiting active
```

---

# 48. Regression Test

After implementing Feature 001, verify:

```text
Frontend starts
Backend starts
Health endpoint works
Documents page works
Document upload works
Document listing works
Document deletion works
AI Tutor works
General AI questions work
Conversation history works
Rate limiting works
```

Only after these checks pass should the feature be considered ready for broader verification.

---

# 49. End-to-End Feature Test

The complete Document-Aware AI Tutor workflow should be tested from the student's perspective.

## Scenario

### Step 1

Open StudyGen.

### Step 2

Open Documents.

### Step 3

Upload a valid PDF.

### Step 4

Wait for processing.

### Step 5

Confirm document status becomes:

```text
Ready
```

### Step 6

Select the document.

### Step 7

Open AI Tutor.

### Step 8

Ask a question based on the document.

### Step 9

Verify the answer uses document content.

### Step 10

Ask a follow-up question.

### Step 11

Verify conversation context is preserved.

### Step 12

Ask something not covered by the document.

### Step 13

Verify the tutor communicates that the document does not provide enough information.

---

# 50. Test Data

Maintain small test documents for repeatable verification.

Recommended test files:

```text
test-ai-notes.pdf
test-ml-notes.docx
test-simple-notes.txt
test-empty.txt
test-corrupted.pdf
test-large-file.pdf
```

The content should be intentionally simple and contain unique facts that can be verified easily.

---

# 51. AI Response Verification

AI responses should not be evaluated solely on exact wording.

The verification should focus on:

### Grounding

Is the answer supported by the selected document?

### Accuracy

Does the response correctly represent the document?

### Context

Does the tutor understand the conversation?

### Honesty

Does it avoid claiming unsupported information?

### Relevance

Does it answer the student's actual question?

### Usability

Is the explanation understandable to a student?

---

# 52. AI Non-Determinism

Gemini responses may vary between requests.

Therefore, tests should generally verify behavioral requirements rather than exact generated text.

Avoid tests such as:

```text
Response must equal exactly:
"Machine Learning is..."
```

Prefer:

```text
Response must mention the concept supported by the document.
```

---

# 53. Performance Checks

Initial implementation should verify that:

* Small documents process successfully.
* Normal tutor requests complete without unnecessary delay.
* Document processing does not block unrelated API operations unnecessarily.
* Large-but-valid documents do not crash the backend.

Detailed performance benchmarking can be introduced later if required.

---

# 54. Failure Recovery

When document processing fails:

```text
Document
   ↓
Processing
   ↓
Failed
```

The application should remain usable.

The student should still be able to:

* View other documents.
* Upload another document.
* Use the general AI Tutor.
* Retry processing where supported.

---

# 55. Test Completion Criteria

Feature 001 can be considered ready for release when:

```text
[ ] Valid PDF processing works
[ ] Valid DOCX processing works
[ ] Valid TXT processing works
[ ] Invalid files are rejected
[ ] Oversized files are rejected
[ ] Document metadata remains correct
[ ] Document selection works
[ ] Document ID reaches backend
[ ] Document context reaches AI service
[ ] AI responses are grounded
[ ] Missing document information is handled honestly
[ ] Conversation history still works
[ ] General AI Tutor still works
[ ] Rate limiting still works
[ ] Gemini errors are handled safely
[ ] Frontend error states work
[ ] Security checks pass
[ ] Regression checks pass
[ ] End-to-end workflow passes
```

---

# 56. Verification Commands

The exact commands depend on the repository configuration.

Typical backend verification:

```powershell
python -m uvicorn main:app --reload
```

Frontend development:

```powershell
npm run dev
```

Frontend linting, if configured:

```powershell
npm run lint
```

Additional tests should be added as the project test suite grows.

---

# 57. Test Documentation Rule

When a new feature changes behavior:

1. Add the required test cases.
2. Update this document.
3. Run the relevant verification.
4. Record important failures.
5. Fix the implementation.
6. Repeat verification.

Testing documentation should evolve together with the project.

---

# 58. Final Verification Principle

The goal of testing is not simply:

```text
"Does the code run?"
```

The actual goal is:

```text
"Can a student reliably use StudyGen to accomplish
the intended learning task without the new feature
breaking existing functionality?"
```

For Feature 001, the most important verification is:

```text
Upload
   ↓
Process
   ↓
Select
   ↓
Ask
   ↓
Ground
   ↓
Answer
```

That complete student workflow must work reliably before Document-Aware AI Tutor is considered complete.
