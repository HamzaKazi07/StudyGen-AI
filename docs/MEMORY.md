# StudyGen-AI — Project Memory

## 1. Project Identity

**Project Name:** StudyGen-AI

**Project Type:** AI-Powered Study Assistant

**Primary Goal:**

StudyGen-AI is designed to help students:

* Organize study material.
* Learn academic concepts.
* Ask questions to an AI tutor.
* Interact with uploaded study documents.
* Generate useful learning experiences from educational content.

The project is being developed as an AI-focused academic project and portfolio application.

---

# 2. Current Major Feature

## Feature 001 — Document-Aware AI Tutor

The current major feature being developed is:

> Allow a student to select an uploaded document and ask questions that are answered using the content of that document.

Core workflow:

```text
Student
   ↓
Upload Document
   ↓
Document Processing
   ↓
Document Ready
   ↓
Select Document
   ↓
Open AI Tutor
   ↓
Ask Question
   ↓
Document Context
   ↓
Gemini
   ↓
AI Answer
```

The purpose is to make the existing StudyGen AI Tutor capable of learning from the student's uploaded study material.

---

# 3. Technology Stack

## Frontend

StudyGen uses:

```text
React
Vite
JavaScript / JSX
Tailwind CSS
Axios
```

The frontend is responsible for:

* User interface
* Navigation
* Document interaction
* AI Tutor chat interface
* Loading states
* Error states
* User interaction

---

## Backend

StudyGen uses:

```text
Python
FastAPI
Uvicorn
```

The backend is responsible for:

* API routes
* Request validation
* Document uploads
* File processing
* Document storage
* AI orchestration
* Rate limiting
* Backend error handling

---

## AI

StudyGen currently uses:

```text
Google Gemini API
```

The existing Gemini integration is located in:

```text
backend/services/ai_service.py
```

The API key is loaded from an environment variable:

```text
GEMINI_API_KEY
```

The Gemini API must remain backend-only.

---

# 4. Existing AI Tutor

The AI Tutor already supports general educational questions.

Its intended behavior is:

* Explain difficult concepts simply.
* Give examples.
* Explain programming code.
* Show important mathematical steps.
* Provide concise exam-oriented answers.
* Handle follow-up questions using conversation history.
* Simplify explanations when requested.
* Use headings, lists, and code blocks when useful.
* Remain accurate and educational.
* Admit uncertainty when appropriate.
* Stay focused on the student's question.

The existing AI Tutor must not be replaced when implementing Document-Aware AI Tutor.

---

# 5. AI Tutor Backend

The existing tutor route is:

```text
POST /api/tutor/ask
```

The route is implemented in:

```text
backend/routes/tutor.py
```

The existing tutor request includes:

```text
question
history
```

The implementation also includes:

* Input validation.
* Maximum question length.
* Conversation history handling.
* IP-based rate limiting.
* Safe error responses.

Current rate-limit configuration:

```text
20 requests
60-second window
```

---

# 6. AI Service

The existing AI service is:

```text
backend/services/ai_service.py
```

The service:

1. Loads environment variables.
2. Reads `GEMINI_API_KEY`.
3. Creates the Gemini client.
4. Maintains the StudyGen AI Tutor system instruction.
5. Converts conversation history into Gemini content.
6. Sends the request to Gemini.
7. Returns the generated response.

The Document-Aware AI Tutor should extend this service rather than create another Gemini client.

Conceptually, the service may evolve from:

```python
ask_gemini(
    question,
    history
)
```

to:

```python
ask_gemini(
    question,
    history,
    document_context
)
```

while preserving existing behavior.

---

# 7. Existing Document System

StudyGen already has document upload functionality.

Supported formats:

```text
PDF
DOCX
TXT
```

Maximum file size:

```text
20 MB
```

Documents are stored under the backend document upload directory:

```text
backend/uploads/documents/
```

Generated UUIDs are used for document identification.

---

# 8. Document API

The document router is:

```text
backend/routes/documents.py
```

The router uses:

```text
/api/documents
```

Existing functionality includes:

```text
POST /api/documents/upload
GET  /api/documents
DELETE /api/documents/{document_id}
```

The upload workflow currently:

```text
Receive File
   ↓
Validate Filename
   ↓
Validate Extension
   ↓
Validate Content Type
   ↓
Generate UUID
   ↓
Save File
   ↓
Create Metadata
   ↓
Store Metadata
```

---

# 9. Document Metadata

Current document metadata includes information such as:

```json
{
  "id": "document-uuid",
  "name": "example.pdf",
  "filename": "generated-uuid.pdf",
  "type": "PDF",
  "size": 123456,
  "size_mb": 0.12,
  "status": "Uploaded",
  "uploaded_at": "..."
}
```

The metadata implementation is currently in memory.

This means document metadata does not yet provide long-term persistent storage.

Do not assume database persistence exists unless it is explicitly implemented.

---

# 10. Document Processing Goal

The next stage of the project is to process uploaded documents.

Target processing flow:

```text
Upload
   ↓
Validate
   ↓
Save
   ↓
Extract Text
   ↓
Process
   ↓
Ready
```

Possible states:

```text
Uploaded
Processing
Ready
Failed
```

The processing system should support:

### PDF

Extract readable text from PDF pages.

### DOCX

Extract text from document paragraphs.

### TXT

Read the text content directly.

---

# 11. Document-Aware AI Goal

Once document processing is implemented, the tutor should be able to receive document context.

Example:

```text
Selected Document:
Machine Learning Notes.pdf

Student:
Explain supervised learning from this document.
```

Expected architecture:

```text
React
   ↓
FastAPI
   ↓
Document Lookup
   ↓
Extracted Document Text
   ↓
AI Service
   ↓
Gemini
   ↓
Grounded Answer
```

---

# 12. Document Grounding Rules

When a document is selected:

### If the answer exists in the document

The AI should use the document content.

### If the document does not contain enough information

The AI should clearly communicate that the document does not provide enough information.

### The AI must not

* Invent document content.
* Claim unsupported information came from the document.
* Pretend that general knowledge came from the student's document.

Document context and general AI knowledge must remain distinguishable.

---

# 13. Frontend Documents Page

The Documents page is implemented in:

```text
frontend/src/components/Documents.jsx
```

The page is responsible for:

* Showing the document library.
* Uploading documents.
* Searching documents.
* Displaying document information.
* Opening documents.
* Asking AI questions.
* Managing document actions.

The Document-Aware AI feature should extend this existing page rather than replace it.

---

# 14. Frontend AI Tutor

The AI Tutor is an existing StudyGen page/component.

It provides:

* Chat interface.
* User messages.
* AI responses.
* Conversation history.
* Loading state.
* Error handling.
* Document-aware functionality in the new feature.

The AI Tutor UI has already been improved to use a chat-oriented layout with a single page scrollbar behavior and an internal chat experience.

Do not unnecessarily redesign the existing AI Tutor while implementing document grounding.

---

# 15. Main Backend Application

The FastAPI application is currently defined in:

```text
backend/main.py
```

It provides:

```text
GET /
GET /health
```

and includes the existing routers.

Current application structure conceptually:

```text
FastAPI
   ├── Tutor Router
   └── Documents Router
```

New routes should be added through routers rather than placing large feature implementations directly inside `main.py`.

---

# 16. CORS

The backend uses FastAPI CORS middleware.

The frontend development URL is:

```text
http://localhost:5173
```

The configuration also supports:

```text
http://127.0.0.1:5173
```

The environment variable:

```text
FRONTEND_URL
```

may be used for deployment configuration.

---

# 17. Project Structure

The project should generally follow this structure:

```text
StudyGen-AI/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── ...
│   └── ...
│
├── backend/
│   ├── main.py
│   │
│   ├── routes/
│   │   ├── tutor.py
│   │   ├── documents.py
│   │   └── ...
│   │
│   ├── services/
│   │   ├── ai_service.py
│   │   ├── document_service.py
│   │   └── ...
│   │
│   ├── uploads/
│   │   └── documents/
│   │
│   └── ...
│
├── PRD.md
├── ARCHITECTURE.md
├── DESIGN.md
├── RULES.md
├── TASKS.md
├── DECISIONS.md
├── MEMORY.md
└── ...
```

The exact structure should follow the actual repository if it differs.

Do not create duplicate directories merely to match this document.

---

# 18. Important Existing Behavior

Future development must preserve:

```text
AI Tutor
Document Upload
Document Listing
Document Deletion
Frontend Navigation
API Startup
Health Check
```

New functionality should be incremental.

---

# 19. Current Limitations

The following limitations are known or intentionally unresolved:

### Document metadata

Currently stored in memory.

### Document persistence

Not yet a permanent database-backed system.

### Document retrieval

Basic document lookup exists, but full document-aware retrieval must still be integrated with the AI Tutor.

### Document processing

PDF, DOCX, and TXT extraction must be completed and integrated into the upload workflow.

### Semantic retrieval

No vector database or embedding-based retrieval system is currently required for the first implementation.

### User accounts

A complete persistent user/document ownership system is not part of the initial implementation.

---

# 20. Future RAG Possibility

A vector database is intentionally not required for Feature 001.

Future architecture may become:

```text
Document
   ↓
Text Extraction
   ↓
Chunking
   ↓
Embeddings
   ↓
Vector Database
   ↓
Relevant Chunks
   ↓
Gemini
   ↓
Answer
```

This should only be introduced when project requirements justify it.

---

# 21. Security Memory

Important security rules:

* Never commit API keys.
* Never expose Gemini credentials to React.
* Validate uploaded file types.
* Enforce the 20 MB upload limit.
* Generate safe document filenames.
* Keep uploaded documents in controlled storage.
* Do not expose server paths.
* Do not expose stack traces to students.
* Do not log sensitive document contents unnecessarily.
* Do not return raw Gemini/API errors to the frontend.

---

# 22. Development Workflow

The preferred workflow for AI-assisted development is:

```text
Specification
      ↓
Clarification
      ↓
Architecture / Design
      ↓
Technical Plan
      ↓
Tasks
      ↓
Implementation
      ↓
Testing
      ↓
Verification
```

For Spec Kit, the intended workflow is:

```text
/specify
    ↓
/clarify
    ↓
/plan
    ↓
/tasks
    ↓
/implement
    ↓
/verify
```

AI agents should read the project guidance before modifying code.

---

# 23. Spec Kit Context

StudyGen-AI uses a specification-first development approach.

Important project documents include:

```text
constitution.md
PRD.md
ARCHITECTURE.md
DESIGN.md
RULES.md
TASKS.md
DECISIONS.md
MEMORY.md
TEST_PLAN.md
SECURITY.md
.env.example
```

These documents provide different types of context.

### Constitution

Project principles and governance.

### PRD

Product requirements.

### Architecture

System structure and technical boundaries.

### Design

UI and interaction decisions.

### Rules

Implementation conventions.

### Tasks

Actionable implementation steps.

### Decisions

Important architectural decisions.

### Memory

Persistent project context.

### Test Plan

Verification strategy.

### Security

Security requirements.

### `.env.example`

Required configuration placeholders.

---

# 24. AI Coding Agent Rules

Before changing code, an AI coding agent should:

1. Read the relevant project documentation.
2. Identify the affected files.
3. Understand existing behavior.
4. Avoid unrelated refactoring.
5. Make the smallest appropriate change.
6. Run the relevant checks.
7. Inspect errors.
8. Verify the affected workflow.
9. Preserve existing functionality.

An AI agent should not assume that a new framework or library is required simply because it could solve a problem.

---

# 25. Important File Locations

| Purpose              | Location                                |
| -------------------- | --------------------------------------- |
| FastAPI application  | `backend/main.py`                       |
| AI Tutor route       | `backend/routes/tutor.py`               |
| Document route       | `backend/routes/documents.py`           |
| Gemini service       | `backend/services/ai_service.py`        |
| Document service     | `backend/services/document_service.py`  |
| Uploaded documents   | `backend/uploads/documents/`            |
| Documents UI         | `frontend/src/components/Documents.jsx` |
| AI Tutor UI          | Existing frontend AI Tutor component    |
| Project requirements | `PRD.md`                                |
| Architecture         | `ARCHITECTURE.md`                       |
| Design               | `DESIGN.md`                             |
| Rules                | `RULES.md`                              |
| Tasks                | `TASKS.md`                              |
| Decisions            | `DECISIONS.md`                          |
| Project memory       | `MEMORY.md`                             |
| Test plan            | `TEST_PLAN.md`                          |
| Security             | `SECURITY.md`                           |

If an actual repository path differs, inspect the repository before modifying it.

---

# 26. Current Feature State

## Feature 001 — Document-Aware AI Tutor

Current target:

```text
[ ] Document processing
[ ] Extract text from PDF
[ ] Extract text from DOCX
[ ] Extract text from TXT
[ ] Document processing state
[ ] Document selection
[ ] Document ID sent to tutor
[ ] Document context passed to AI service
[ ] Grounded AI responses
[ ] Unsupported-information handling
[ ] Document-aware testing
[ ] Regression testing
```

Existing functionality:

```text
[x] React/Vite frontend
[x] FastAPI backend
[x] Gemini AI Tutor
[x] AI Tutor conversation history
[x] Tutor rate limiting
[x] Document upload
[x] PDF/DOCX/TXT validation
[x] 20 MB upload limit
[x] Document listing
[x] Document deletion
[x] Environment-based Gemini API key
```

---

# 27. Product Direction

StudyGen-AI should evolve toward an integrated learning assistant rather than becoming only a chatbot.

Long-term learning workflow:

```text
Study Material
      ↓
Documents
      ↓
AI Tutor
      ↓
Questions
      ↓
Explanations
      ↓
Quizzes
      ↓
Flashcards
      ↓
Progress
```

The AI Tutor is one part of the broader StudyGen learning experience.

---

# 28. Important Principle

The central product idea is:

> **StudyGen should help students learn from their own study material, not simply provide generic AI answers.**

Every future AI feature should be evaluated against this goal.

---

# 29. Memory Update Rule

When a significant architectural or product change occurs:

1. Update the relevant documentation.
2. Update this `MEMORY.md` file if the change affects persistent project context.
3. Add an entry to `DECISIONS.md` if it represents an important architectural decision.
4. Update `TASKS.md` if implementation work changes.
5. Update `TEST_PLAN.md` if verification requirements change.

This prevents project documentation from becoming inconsistent with the actual codebase.

---

# 30. Final Project Mental Model

When an AI coding agent starts working on StudyGen-AI, it should understand the project as:

```text
                    StudyGen-AI
                         |
             AI-Powered Study Assistant
                         |
       ┌─────────────────┼─────────────────┐
       ↓                 ↓                 ↓
   Documents          AI Tutor         Learning Tools
       |                 |              /    |    \
       |                 |          Quizzes Flashcards Progress
       ↓                 ↓
 Document Processing   Gemini AI
       |
       ↓
 Document Context
       |
       └──────────────→ AI Tutor
                           |
                           ↓
                    Student Learning
```

The immediate development priority is:

```text
Document
   ↓
Process
   ↓
Select
   ↓
Ask AI
   ↓
Grounded Answer
```

All implementation decisions should preserve this direction.
