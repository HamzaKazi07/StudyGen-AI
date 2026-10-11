# StudyGen-AI Development Rules

## 1. Purpose

These rules define how StudyGen-AI should be modified, extended, tested, and maintained.

They apply to:

* Human developers
* AI coding assistants
* Automated coding agents
* Feature implementation
* Bug fixes
* Refactoring
* Testing
* Documentation

The primary objective is to improve StudyGen-AI without unnecessarily changing its existing architecture or breaking working functionality.

---

# 2. Technology Stack Rule

The existing technology stack MUST be preserved unless a change is explicitly approved and documented.

Current stack:

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
* Google GenAI Python client

### Document Processing

* PDF processing using the existing Python PDF tooling
* DOCX processing using the existing Python DOCX tooling
* TXT processing using standard Python file handling

Do NOT replace these technologies simply because another framework or library may be available.

---

# 3. No Unnecessary Technology Changes

AI agents MUST NOT introduce a new:

* Frontend framework
* Backend framework
* AI provider
* Database
* Vector database
* Authentication system
* State-management framework
* Document-processing framework

unless the feature specification explicitly requires it and the implementation plan justifies the change.

For example, Feature 001 should NOT introduce a vector database merely because the feature is document-aware.

---

# 4. Preserve Working Features

Existing working functionality MUST remain functional after a change.

Before modifying shared code, identify affected functionality.

Important existing workflows include:

```text
Document Upload
AI Tutor
AI Tutor Chat
Document Listing
Document Deletion
Frontend Navigation
Backend API
Gemini Integration
```

A new feature must extend these workflows rather than unnecessarily replacing them.

---

# 5. Smallest Useful Change

Prefer the smallest implementation that satisfies the requirement.

Do NOT:

* Rewrite entire files without need.
* Rename unrelated components.
* Reorganize the entire project.
* Replace working libraries.
* Perform unrelated cleanup.
* Introduce speculative abstractions.

If a change can be implemented by modifying one existing function, do not create a new architecture for it.

---

# 6. Frontend Rules

Frontend code is responsible for:

* UI
* User interaction
* Client-side state
* Loading states
* Error presentation
* Navigation
* Displaying API results

Frontend code MUST NOT:

* Store API secrets.
* Call Gemini directly.
* Read server-side document files directly.
* Perform backend-only document processing.
* Depend on local server filesystem paths.

The frontend communicates with the backend through HTTP APIs.

---

# 7. Backend Rules

Backend code is responsible for:

* Request validation
* File validation
* File storage
* Document processing
* AI orchestration
* Security checks
* Error handling

Backend code MUST NOT expose internal implementation details unnecessarily to the frontend.

---

# 8. API Contract Rules

Frontend and backend communication MUST use explicit API contracts.

When an API response is changed, the affected frontend code MUST be checked.

Avoid silently changing existing response fields.

For example, if an existing response contains:

```json
{
  "success": true,
  "answer": "..."
}
```

do not remove or rename `success` or `answer` without intentionally updating the API contract and all affected consumers.

---

# 9. Document Upload Rules

Uploaded documents MUST be validated before storage.

Supported formats:

```text
.pdf
.docx
.txt
```

Maximum file size:

```text
20 MB
```

The backend MUST validate:

* Filename
* Extension
* Content type where available
* File size

Uploaded files MUST be stored only inside the intended document storage directory.

---

# 10. Safe File Naming

Original filenames MUST NOT be used directly as storage filenames.

Documents should use generated identifiers.

Example:

```text
Original:

Data Structures Notes.pdf

Stored:

<generated-uuid>.pdf
```

This helps prevent:

* Filename collisions
* Unsafe paths
* Accidental overwrites

---

# 11. Document Processing Rules

Document processing MUST happen on the backend.

The processing workflow should be:

```text
Upload
   ↓
Validate
   ↓
Store
   ↓
Extract Text
   ↓
Clean / Normalize
   ↓
Make Available to AI Tutor
```

The frontend must not be responsible for extracting document text.

---

# 12. Document-Aware AI Rules

When a student asks a question about a selected document, the AI Tutor MUST use the available document content as context.

The system MUST distinguish between:

```text
Information supported by the document
```

and:

```text
General knowledge
```

The AI MUST NOT present unsupported information as though it came from the document.

If the document does not contain enough information to answer a document-specific question, the response should communicate that limitation.

---

# 13. AI Prompt Rules

AI prompts should remain inside the backend AI service.

Preferred architecture:

```text
Frontend
   ↓
FastAPI Route
   ↓
AI Service
   ↓
Gemini
```

Do NOT construct Gemini API calls directly inside React components.

Do NOT expose the Gemini API key to the browser.

---

# 14. AI Response Rules

AI Tutor responses should be:

* Clear
* Educational
* Relevant
* Student-friendly
* Focused on the question

The existing StudyGen AI Tutor behavior should be preserved unless the feature specification explicitly changes it.

Responses may use:

* Headings
* Bullet points
* Numbered lists
* Examples
* Code blocks

when appropriate.

---

# 15. Conversation History Rules

Existing conversation-history functionality should not be removed when adding document context.

If the tutor already receives conversation history, document context should be incorporated without unnecessarily replacing the existing conversation mechanism.

The implementation must avoid duplicating the same message or document context unnecessarily.

---

# 16. Error Handling Rules

Errors MUST be handled at the layer where they are understood.

Backend errors should use stable HTTP status codes and machine-readable error information where appropriate.

Frontend errors should be converted into simple user-facing messages.

Never expose:

* Stack traces
* API keys
* Internal file paths
* Raw provider errors
* Database credentials
* Internal implementation details

to the student.

---

# 17. Logging Rules

Backend logging should help developers diagnose failures.

Logs SHOULD include useful technical context such as:

```text
Operation
Document ID
Request type
Error category
```

Logs MUST NOT unnecessarily contain:

* API keys
* Passwords
* Full document contents
* Sensitive user data
* Complete AI prompts containing private document content

---

# 18. Environment Variable Rules

Secrets MUST come from environment variables.

Example:

```text
GEMINI_API_KEY=...
```

Never hard-code:

```python
GEMINI_API_KEY = "actual-secret-key"
```

The repository may contain:

```text
.env.example
```

but must not contain the real `.env` credentials.

---

# 19. Database Rules

Do not introduce persistent database storage unless the feature explicitly requires it.

If persistent storage becomes necessary, the implementation plan must explain:

* Why persistence is required.
* What data will be stored.
* How the data will be accessed.
* How existing functionality will be affected.
* How migration will be handled.

Do not add a database simply for future possibilities.

---

# 20. Vector Database Rules

A vector database is NOT required for the first implementation of Document-Aware AI Tutor.

The initial implementation should use the simplest reliable document-context approach.

Vector search may be considered later when:

* Documents become large.
* Multiple documents need to be searched.
* Context limits become a practical problem.
* Semantic retrieval becomes a demonstrated requirement.

Any vector database introduction requires a documented architectural decision.

---

# 21. UI Rules

UI changes MUST preserve the existing StudyGen-AI visual language.

Use the existing:

* Tailwind CSS patterns
* Spacing
* Typography
* Buttons
* Cards
* Colors
* Borders
* Responsive behavior

Do not introduce a separate design system for one feature.

---

# 22. AI Tutor UI Rules

The AI Tutor must maintain:

* A clear chat area.
* A usable question input.
* Visible loading state.
* Clear user/AI message distinction.
* Appropriate scrolling behavior.
* Responsive layout.

The AI Tutor page should have only the intended page-level scrolling behavior.

The chat area may have its own scroll behavior when the conversation becomes larger than the available chat space.

---

# 23. Document Selection Rules

A student must be able to clearly identify which document is active.

The UI should display something similar to:

```text
Using:
📄 Data Structures Notes.pdf
```

The system must not silently select an arbitrary document.

If the selected document is deleted or unavailable, the selected-document state must be cleared or recovered gracefully.

---

# 24. State Management Rules

Use the existing React state-management approach.

Do not introduce Redux, Zustand, MobX, or another state-management framework unless explicitly required.

Keep state close to the components that own it when practical.

Prefer simple state such as:

```javascript
documents
selectedDocument
messages
question
isLoading
error
```

over unnecessary global state.

---

# 25. Code Quality Rules

Code should favor:

* Small functions
* Descriptive names
* Straightforward control flow
* Existing project conventions
* Minimal duplication
* Clear API boundaries

Avoid:

* Extremely large functions
* Deeply nested conditionals
* Unnecessary abstractions
* Unused imports
* Dead code
* Unused variables
* Temporary debugging code

---

# 26. Dependency Rules

Before adding a dependency, determine whether the existing project already provides the required capability.

A new dependency should only be added when:

1. The requirement cannot reasonably be implemented using existing dependencies.
2. The dependency is compatible with the current stack.
3. The dependency provides a clear benefit.
4. The dependency does not introduce unnecessary complexity.

The implementation plan should mention significant new dependencies.

---

# 27. File Modification Rules

Before modifying a file:

1. Read the current file.
2. Understand its existing responsibility.
3. Identify affected functionality.
4. Make the smallest required change.
5. Check imports.
6. Check dependent files.
7. Run the relevant verification.

AI agents must not assume the current file contents.

---

# 28. Do Not Overwrite Existing Work

AI agents MUST NOT blindly replace user-written code.

Before replacing substantial code:

* Inspect the current implementation.
* Preserve useful existing behavior.
* Identify differences from the planned implementation.
* Make targeted modifications where possible.

Existing project work takes priority over generated boilerplate.

---

# 29. Testing Rules

Every behavior change requires verification.

Depending on the change, use:

```text
Unit Test
API Test
Integration Test
Manual UI Test
End-to-End Test
```

At minimum, a user-visible feature should receive a focused manual verification.

---

# 30. Document Feature Verification

Feature 001 should verify at least:

```text
✓ PDF upload
✓ DOCX upload
✓ TXT upload
✓ Invalid file rejection
✓ File-size limit
✓ Document listing
✓ Document deletion
✓ Document selection
✓ Document text extraction
✓ AI question using selected document
✓ AI response
✓ Missing document handling
✓ Processing failure handling
✓ AI failure handling
```

---

# 31. Regression Rules

After implementing a feature, verify that existing functionality still works.

For Feature 001, check:

```text
✓ Application starts
✓ Frontend loads
✓ Backend starts
✓ Documents page works
✓ Upload works
✓ Document listing works
✓ Delete works
✓ AI Tutor opens
✓ Normal AI Tutor behavior remains functional
✓ New document-aware workflow works
```

---

# 32. Git Rules

Changes should be committed in logical units.

Example:

```text
feat: add document-aware tutor API

feat: add document selection to tutor

feat: add document text extraction

test: verify document-aware tutor workflow
```

Avoid commits containing unrelated changes.

Do not commit:

```text
.env
API keys
Passwords
Large generated files
Virtual environments
node_modules
Temporary files
```

---

# 33. Documentation Rules

Important architectural or behavioral changes should be documented.

Relevant documentation includes:

```text
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

Documentation should describe the actual implementation and must not claim functionality that does not exist.

---

# 34. Spec Kit Rules

When using GitHub Spec Kit, follow this workflow:

```text
Specify
   ↓
Clarify
   ↓
Plan
   ↓
Tasks
   ↓
Implement
   ↓
Verify
```

AI agents should not skip directly from a vague requirement to large-scale implementation.

The specification should define:

* User need
* Expected behavior
* Scope
* Acceptance criteria
* Constraints

The plan should define:

* Technical approach
* Files affected
* APIs
* Data flow
* Testing strategy

Tasks should define:

* Small actionable implementation steps
* Dependencies
* Verification

---

# 35. Feature Scope Rules

For Feature 001:

> Document-Aware AI Tutor

The first implementation should focus on:

```text
Upload
   ↓
Process
   ↓
Select
   ↓
Ask
   ↓
Answer
```

Do not expand the feature unnecessarily into:

* Advanced RAG
* Multi-document reasoning
* Automatic quiz generation
* Flashcard generation
* Full document summarization
* Document collaboration

unless those requirements are explicitly added.

---

# 36. AI Agent Behavior

AI coding agents working on StudyGen-AI should:

1. Read the relevant documentation first.
2. Read the current implementation before modifying it.
3. Follow the constitution.
4. Follow these rules.
5. Follow the feature specification.
6. Follow the implementation plan.
7. Make small changes.
8. Verify each meaningful change.
9. Report files changed.
10. Report tests/checks performed.
11. Clearly identify anything not implemented.

The agent must not silently make architectural decisions that conflict with the project documentation.

---

# 37. Priority Order

When requirements conflict, use this priority:

```text
1. Explicit user requirement
2. Feature specification
3. StudyGen-AI Constitution
4. Architecture
5. Design
6. Development Rules
7. Existing implementation conventions
8. General AI assumptions
```

If a conflict cannot be resolved safely, stop the affected implementation step and document the issue rather than guessing.

---

# 38. Definition of Done

A feature is considered complete only when:

```text
Requirements implemented
        ↓
Code reviewed
        ↓
Error paths checked
        ↓
Relevant tests/checks completed
        ↓
Existing functionality verified
        ↓
Documentation updated
        ↓
No secrets committed
        ↓
Feature manually verified
```

A feature should not be considered complete merely because the code compiles or the application starts.

---

# 39. Core Rule

The most important development rule for StudyGen-AI is:

> **Do not add complexity unless the requirement requires it.**

StudyGen-AI should evolve incrementally:

```text
Existing Working System
        ↓
Small Feature
        ↓
Verify
        ↓
Document
        ↓
Next Feature
```

The goal is a reliable, understandable, student-focused AI study assistant rather than a collection of unnecessary technologies.
