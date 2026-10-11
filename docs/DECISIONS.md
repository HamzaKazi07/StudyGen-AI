# StudyGen-AI — Architecture Decision Log

## Purpose

This document records important technical and architectural decisions made during the development of **StudyGen-AI**.

The purpose is to prevent future developers or AI coding agents from repeatedly reconsidering decisions that have already been made.

New architectural decisions should be added when they materially affect:

* Technology choices
* System architecture
* Data flow
* AI integration
* Document processing
* Security
* Persistence
* Testing
* Deployment

---

# Decision 001 — Use React + Vite for the Frontend

**Status:** Accepted

## Decision

StudyGen-AI will continue using:

* React
* Vite
* JavaScript / JSX
* Tailwind CSS

for the frontend.

## Reason

The existing project already uses React + Vite successfully.

The current UI contains multiple study-oriented pages and components, including:

* Dashboard
* Documents
* AI Tutor
* Quizzes
* Flashcards
* Progress

Replacing the frontend framework would introduce unnecessary migration work and could break existing functionality.

## Consequence

New frontend features should be implemented using the existing React/Vite architecture.

A new frontend framework should not be introduced unless there is a documented architectural reason.

---

# Decision 002 — Use FastAPI for the Backend

**Status:** Accepted

## Decision

StudyGen-AI will use Python with FastAPI as its primary backend API framework.

## Reason

The existing backend already provides:

* API routing
* Request validation
* CORS configuration
* AI Tutor endpoints
* Document upload endpoints
* Error handling
* Rate limiting

FastAPI also integrates naturally with Python-based AI and document-processing libraries.

## Consequence

Backend features should be implemented as FastAPI routes and services rather than introducing another backend framework.

---

# Decision 003 — Continue Using Google Gemini

**Status:** Accepted

## Decision

StudyGen-AI will continue using the existing Google Gemini integration.

The Gemini client is initialized in:

```text
backend/services/ai_service.py
```

The API key is loaded from:

```text
GEMINI_API_KEY
```

through environment configuration.

## Reason

The AI Tutor already works with Gemini.

Introducing another AI provider would add:

* Additional configuration
* Additional dependencies
* Additional API contracts
* More error-handling paths
* Additional maintenance

The current objective is to improve the existing StudyGen AI Tutor rather than replace its AI provider.

## Consequence

The Document-Aware AI Tutor should extend the existing Gemini service rather than create a second AI service.

---

# Decision 004 — Keep AI Orchestration in the Backend

**Status:** Accepted

## Decision

All Gemini API communication must remain on the backend.

The React frontend must never directly contain the Gemini API key.

## Reason

API credentials must not be exposed to browser clients.

The backend provides a controlled boundary for:

* Authentication and authorization in future implementations
* Request validation
* Rate limiting
* Prompt construction
* Document context handling
* Error handling
* AI provider communication

## Consequence

The frontend communicates with:

```text
FastAPI
   ↓
AI Service
   ↓
Gemini
```

rather than:

```text
React
   ↓
Gemini
```

---

# Decision 005 — Process Documents on the Backend

**Status:** Accepted

## Decision

PDF, DOCX, and TXT document processing will occur in the FastAPI backend.

## Reason

Document processing is part of backend data handling and should not depend on browser-specific processing.

The backend can:

* Validate files
* Control storage
* Extract text
* Handle processing failures
* Prepare content for AI processing

This also keeps the frontend focused on presentation and user interaction.

## Consequence

The document workflow is:

```text
React
  ↓
FastAPI Upload API
  ↓
File Storage
  ↓
Document Processing
  ↓
Extracted Text
  ↓
AI Service
```

---

# Decision 006 — Support PDF, DOCX, and TXT

**Status:** Accepted

## Decision

The first document-aware implementation supports:

```text
.pdf
.docx
.txt
```

## Reason

These formats are already part of the StudyGen document upload workflow.

They cover common student study materials while keeping the initial processing implementation manageable.

## Consequence

Other formats should not be added automatically.

Formats such as PPTX, XLSX, EPUB, images, or scanned PDFs should be treated as future extensions unless explicitly required.

---

# Decision 007 — Keep the Existing 20 MB Upload Limit

**Status:** Accepted

## Decision

The existing maximum document size remains:

```text
20 MB
```

## Reason

The current upload implementation already validates file size.

The limit helps control:

* Storage usage
* Processing cost
* Memory usage
* AI context size
* Abuse potential

## Consequence

Document-aware functionality must work within the existing file-size constraint.

Changing the limit requires a separate technical decision.

---

# Decision 008 — Use Generated Document IDs

**Status:** Accepted

## Decision

Uploaded documents receive generated UUID identifiers.

Example:

```text
550e8400-e29b-41d4-a716-446655440000
```

The generated ID is used internally instead of relying on the original filename.

## Reason

Original filenames:

* May not be unique.
* May contain unsafe characters.
* Should not be used as storage identifiers.

UUIDs provide a safer internal identifier.

## Consequence

Frontend document actions should use the document ID.

The physical filename should not be exposed as the primary identifier.

---

# Decision 009 — Keep Uploaded Files in Backend Storage

**Status:** Accepted

## Decision

Uploaded documents remain inside the backend's controlled document storage directory.

Current storage concept:

```text
backend/
└── uploads/
    └── documents/
```

## Reason

The existing upload implementation already provides a controlled storage location.

The application should not unnecessarily introduce external object storage at this stage.

## Consequence

The initial implementation does not require:

* AWS S3
* Google Cloud Storage
* Azure Blob Storage
* Cloudinary
* Other external file-storage services

External storage can be considered later if deployment requirements justify it.

---

# Decision 010 — Reuse the Existing Document Metadata Flow

**Status:** Accepted

## Decision

Document-aware functionality should build on the existing document metadata rather than creating a completely separate document system.

Existing metadata includes information such as:

```text
id
name
filename
type
size
size_mb
status
uploaded_at
```

## Reason

Creating another document registry would introduce duplicate sources of truth.

## Consequence

Document processing should extend the existing document lifecycle.

Conceptually:

```text
Uploaded
   ↓
Processing
   ↓
Ready
```

or:

```text
Uploaded
   ↓
Processing
   ↓
Failed
```

---

# Decision 011 — No Vector Database for the First Implementation

**Status:** Accepted

## Decision

The first version of Document-Aware AI Tutor will **not** introduce a vector database.

## Reason

The initial feature goal is to establish a reliable document-aware workflow.

The first implementation can use extracted document text as context.

Adding a vector database immediately would introduce:

* Embedding generation
* Vector storage
* Retrieval logic
* Chunking strategy
* Similarity search
* Additional infrastructure
* Additional debugging complexity

The project should first prove the basic document-aware workflow.

## Consequence

The initial architecture is:

```text
Document
   ↓
Text Extraction
   ↓
Document Context
   ↓
Gemini
   ↓
Answer
```

A future Retrieval-Augmented Generation (RAG) architecture may be introduced if document size or retrieval requirements justify it.

---

# Decision 012 — Do Not Replace the Existing AI Tutor

**Status:** Accepted

## Decision

Document-Aware AI Tutor will extend the existing AI Tutor rather than create a separate tutor application.

## Reason

The existing AI Tutor already supports:

* Chat
* Conversation history
* Gemini responses
* System instructions
* Rate limiting
* Error handling

Replacing it would create unnecessary duplication.

## Consequence

The tutor service should evolve from:

```python
ask_gemini(
    question,
    history
)
```

toward functionality conceptually similar to:

```python
ask_gemini(
    question,
    history,
    document_context
)
```

without breaking existing general-purpose tutor requests.

---

# Decision 013 — Keep Conversation History

**Status:** Accepted

## Decision

The existing conversation-history mechanism will remain part of the AI Tutor.

## Reason

Students frequently ask follow-up questions.

For example:

```text
Student:
What is a binary tree?

Tutor:
...

Student:
Explain it more simply.

Tutor:
...
```

The second question depends on the conversation context.

## Consequence

Document context and conversation history are separate concepts:

```text
Document Context
       +
Conversation History
       +
Current Question
       ↓
Gemini
```

They should not be unnecessarily duplicated.

---

# Decision 014 — Use Explicit Document Context

**Status:** Accepted

## Decision

When a student selects a document, the backend should explicitly provide relevant document content to the AI service.

The AI should receive clear context indicating that the supplied material belongs to the selected study document.

## Reason

The tutor needs to distinguish:

```text
Document information
```

from:

```text
General AI knowledge
```

This supports the project's Document-Grounded AI principle.

## Consequence

The AI system instruction should require the model to avoid falsely claiming that information came from the selected document.

---

# Decision 015 — Document Grounding Takes Priority for Document Questions

**Status:** Accepted

## Decision

When a student asks a question specifically about the selected document, the document content should be treated as the primary source of context.

## Reason

The purpose of the feature is not merely to add the document to the prompt.

The goal is to help students learn from their own study material.

## Expected behavior

If the document contains the answer:

```text
Use the document.
```

If the document does not contain enough information:

```text
Clearly communicate that the document does not provide
enough information.
```

The tutor should not fabricate document-specific evidence.

---

# Decision 016 — Preserve General AI Tutor Mode

**Status:** Accepted

## Decision

StudyGen-AI should continue supporting general AI Tutor questions when no document is selected.

Example:

```text
Student:
What is polymorphism?

Document:
None selected.

Result:
Normal StudyGen AI Tutor response.
```

## Reason

Document-aware functionality should extend the product rather than unnecessarily remove existing functionality.

## Consequence

The tutor API should support both:

```text
General Tutor Mode
```

and:

```text
Document-Aware Tutor Mode
```

---

# Decision 017 — Use Environment Variables for Secrets

**Status:** Accepted

## Decision

Secrets and deployment-specific configuration must be loaded from environment variables.

Examples:

```text
GEMINI_API_KEY
FRONTEND_URL
```

## Reason

Secrets must not be committed to source control.

## Consequence

The project will maintain:

```text
.env
.env.example
```

where:

* `.env` contains local secrets.
* `.env.example` contains placeholders.

---

# Decision 018 — Keep Frontend and Backend Contracts Explicit

**Status:** Accepted

## Decision

React communicates with FastAPI through explicit API contracts.

For example, a document-aware tutor request may conceptually contain:

```json
{
  "question": "Explain this topic.",
  "document_id": "document-uuid",
  "history": []
}
```

## Reason

Clear contracts make the application easier to maintain and debug.

## Consequence

Changes to request or response structures must be reflected on both sides.

---

# Decision 019 — Use Stable Error Responses

**Status:** Accepted

## Decision

Backend errors should return stable HTTP status codes and safe messages.

Examples:

```text
400 — Invalid request
404 — Document not found
413 — File too large
429 — Too many requests
502 — AI service unavailable
```

## Reason

The frontend needs predictable behavior.

Internal implementation details should not be exposed to users.

## Consequence

Frontend error handling should be based on documented API behavior.

---

# Decision 020 — Keep Rate Limiting in the Backend

**Status:** Accepted

## Decision

The existing backend rate limiter remains responsible for controlling AI Tutor requests.

Current configuration:

```text
20 requests
per 60 seconds
per client IP
```

## Reason

AI API requests can consume external resources and incur usage costs.

The backend is the appropriate boundary for controlling request frequency.

## Consequence

New document-aware tutor requests must also pass through the existing rate-limiting mechanism.

---

# Decision 021 — Prefer Incremental Implementation

**Status:** Accepted

## Decision

Feature development should proceed in small verified stages rather than one large code-generation operation.

The workflow is:

```text
Understand
   ↓
Plan
   ↓
Implement
   ↓
Run
   ↓
Verify
   ↓
Continue
```

## Reason

StudyGen-AI is an actively developed project with existing working functionality.

Large uncontrolled changes increase the risk of regressions.

## Consequence

AI coding agents should implement the tasks in `TASKS.md` incrementally.

---

# Decision 022 — Preserve Existing Working Features

**Status:** Accepted

## Decision

New Document-Aware AI Tutor functionality must not unnecessarily break:

* Documents
* AI Tutor
* Dashboard
* Quizzes
* Flashcards
* Progress
* Existing navigation

## Reason

The new feature is an extension of StudyGen-AI, not a replacement of the existing application.

## Consequence

Regression testing is required after major changes.

---

# Decision 023 — Keep Code Beginner-Friendly

**Status:** Accepted

## Decision

The implementation should favor straightforward code over unnecessary abstractions.

Preferred:

```text
Small functions
Clear names
Simple control flow
Explicit API contracts
```

Avoid:

```text
Premature abstraction
Unnecessary frameworks
Duplicate services
Unrelated refactoring
```

## Reason

StudyGen-AI is also a learning and portfolio project.

The codebase should remain understandable to a developer who is joining the project.

---

# Decision 024 — Document Architectural Changes

**Status:** Accepted

## Decision

Significant architectural changes must be recorded in this file.

Each new decision should include:

```text
Decision
Status
Reason
Consequences
```

## Reason

AI coding tools may otherwise repeatedly propose changes that conflict with previous project decisions.

Maintaining this decision log gives future agents persistent architectural context.

---

# Future Decisions

The following topics are intentionally left open until the project requires them:

## Database Persistence

The current document metadata implementation is in-memory.

A persistent database may be introduced later when the application requires:

* User accounts
* Persistent document metadata
* Persistent chat history
* User-specific document ownership
* Progress persistence

No database should be introduced solely for the Document-Aware AI Tutor feature unless required by the implementation.

---

## RAG / Vector Search

A future RAG system may be considered when:

* Documents become significantly larger.
* Multiple documents need to be searched.
* Context-window limitations become a problem.
* Retrieval accuracy becomes important.
* Students need semantic search across their library.

Potential future flow:

```text
Document
   ↓
Text Extraction
   ↓
Chunking
   ↓
Embeddings
   ↓
Vector Store
   ↓
Semantic Retrieval
   ↓
Gemini
   ↓
Grounded Answer
```

This is a future architectural possibility, not part of the initial implementation.

---

## OCR / Scanned Documents

Scanned PDFs and image-based study material may require OCR in a future feature.

This should be introduced only when the product requirements justify it.

---

# Decision Review Rule

Before introducing a new framework, database, AI provider, storage system, or major architectural component, review this document and the project constitution.

The proposed change should answer:

1. What problem does it solve?
2. Why can't the existing architecture solve the problem?
3. What new complexity does it introduce?
4. What existing functionality could be affected?
5. How will it be tested?
6. Does it conflict with the StudyGen-AI Constitution?

If the change is significant, add a new decision to this document before implementation.
