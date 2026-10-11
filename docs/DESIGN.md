# StudyGen-AI Design

## 1. Design Overview

StudyGen-AI is an AI-powered study assistant designed to help students learn from their study material.

This document defines the product and interaction design for:

> **Feature 001 — Document-Aware AI Tutor**

The feature allows a student to:

1. Upload a study document.
2. View uploaded documents.
3. Select a document.
4. Open the AI Tutor.
5. Ask questions about the selected document.
6. Receive answers grounded in the document's extracted content.

The design must integrate into the existing StudyGen-AI interface rather than creating a separate application or replacing existing screens.

---

# 2. Design Goals

The design should provide:

* A simple student-focused workflow.
* Clear document selection.
* Clear indication of which document is being used.
* A familiar AI chat experience.
* Useful loading feedback.
* Clear success and failure states.
* Readable AI responses.
* Minimal unnecessary configuration.
* Consistent StudyGen-AI visual language.
* Easy navigation between Documents and AI Tutor.

The student should not need to understand how document extraction or AI processing works internally.

---

# 3. Primary User Flow

The primary flow is:

```text
Upload Document
      ↓
Document Appears
      ↓
Select Document
      ↓
Open AI Tutor
      ↓
Ask Question
      ↓
Document Processing
      ↓
AI Generates Answer
      ↓
Display Answer
```

Example:

```text
Student uploads:

Data Structures Notes.pdf

        ↓

Selects:

Data Structures Notes.pdf

        ↓

Asks:

"What is a binary tree?"

        ↓

StudyGen processes the document

        ↓

AI Tutor answers using the document
```

---

# 4. Documents Page Design

The existing `Documents.jsx` page remains the primary document-management interface.

The page should provide a clear document list.

Conceptual layout:

```text
+----------------------------------------------------+
| Documents                                          |
|                                                    |
| Upload your study material                         |
|                                                    |
|              [ Upload Document ]                   |
|                                                    |
+----------------------------------------------------+

Your Documents

+----------------------------------------------------+
| 📄 Data Structures Notes.pdf                       |
| PDF • 4.2 MB                                       |
|                                                    |
| [Select for AI Tutor]                    [Delete]  |
+----------------------------------------------------+

+----------------------------------------------------+
| 📄 Operating Systems.docx                          |
| DOCX • 2.8 MB                                      |
|                                                    |
| [Select for AI Tutor]                    [Delete]  |
+----------------------------------------------------+
```

The exact visual styling should follow the existing StudyGen-AI design system.

---

# 5. Document Upload Design

The upload interaction should be straightforward.

The student selects a file and submits it.

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

The interface should communicate these restrictions before or during upload.

Example:

```text
Upload Study Material

Supported formats: PDF, DOCX, TXT
Maximum size: 20 MB

[ Choose File ]

Selected:
Data Structures Notes.pdf

[ Upload ]
```

---

# 6. Upload States

The interface must support the following states.

## Initial State

```text
No file selected

[ Choose File ]
```

## File Selected

```text
Data Structures Notes.pdf

[ Upload ]
```

## Uploading

```text
Uploading...

████████████░░░░
```

The upload button should not allow accidental duplicate submissions while the request is active.

## Success

```text
✓ Document uploaded successfully.
```

The document should then appear in the document list.

## Failure

Example:

```text
Unable to upload the document.

Please make sure the file is a PDF, DOCX, or TXT
and is smaller than 20 MB.
```

Technical exception details should not be displayed to the student.

---

# 7. Document List Design

Each document should display useful metadata.

Minimum information:

```text
Document Name
File Type
File Size
Status
Upload Date
```

Example:

```text
Data Structures Notes.pdf
PDF • 4.2 MB
Uploaded
24 Sep 2026
```

The list should remain readable when multiple documents are uploaded.

---

# 8. Document Selection

The student must have a clear way to select a document for the AI Tutor.

Possible interaction:

```text
[ Use with AI Tutor ]
```

After selection:

```text
✓ Selected for AI Tutor
```

Only the selected document should be used for document-specific questions during that tutor session.

---

# 9. AI Tutor Design

The existing `AITutor.jsx` page remains the main AI Tutor interface.

The document-aware functionality should be integrated into the existing chat interface.

Conceptual layout:

```text
+----------------------------------------------------+
| AI Tutor                                           |
+----------------------------------------------------+
|                                                    |
| Using document:                                    |
| 📄 Data Structures Notes.pdf                       |
|                                                    |
+----------------------------------------------------+
|                                                    |
| Student                                            |
| Explain binary trees in simple words.              |
|                                                    |
| AI Tutor                                           |
| A binary tree is a tree data structure where...    |
|                                                    |
+----------------------------------------------------+
| Ask a question...                         [Send]   |
+----------------------------------------------------+
```

---

# 10. Selected Document Indicator

The selected document should always be visible when document-aware mode is active.

Example:

```text
Using:
📄 Data Structures Notes.pdf
```

This prevents confusion about which study material the AI is using.

If no document is selected:

```text
No document selected

Select a document to ask questions about your study material.
```

---

# 11. Question Input

The student should be able to type a natural-language question.

Examples:

```text
Explain this topic in simple words.

What are the main points of this chapter?

Give me an example from the document.

What is the difference between stack and queue?

Summarize this topic for my exam.
```

The frontend sends the question and selected document ID to the backend.

Conceptual request:

```json
{
  "document_id": "document-uuid",
  "question": "Explain binary trees in simple words."
}
```

---

# 12. Chat Message Design

The chat should visually distinguish between:

### Student

```text
You

Explain binary trees in simple words.
```

### AI Tutor

```text
StudyGen AI Tutor

A binary tree is a data structure in which each
node can have at most two children...
```

AI responses should be formatted for readability.

Where supported by the existing frontend, responses may contain:

* Paragraphs
* Bullet points
* Numbered lists
* Code blocks
* Simple examples

---

# 13. Loading State

When the AI Tutor is processing a question, the interface should clearly indicate that the system is working.

Example:

```text
StudyGen AI Tutor

Thinking...
```

or:

```text
StudyGen AI Tutor
● ● ●
```

The student should not be left wondering whether the request was submitted.

---

# 14. AI Response Success State

A successful response should appear in the chat.

Example:

```text
You:
What are the advantages of a binary search tree?

StudyGen AI Tutor:

According to the selected document, a binary search
tree organizes elements so that smaller values are
stored on one side and larger values on the other.

This structure can make searching more efficient
when the tree is properly organized.
```

The exact answer is generated by Gemini based on the available document context.

---

# 15. AI Error State

If the AI request fails, the student should receive a simple explanation.

Example:

```text
Sorry, I couldn't generate an answer right now.

Please try again.
```

The UI may provide:

```text
[ Try Again ]
```

Internal errors such as:

```text
API exception
stack trace
authentication details
server paths
```

must not be displayed to the student.

---

# 16. Document Not Found State

If the selected document no longer exists:

```text
Document unavailable

The selected document could not be found.

Please select another document.
```

The frontend should recover gracefully rather than leaving the chat in a broken state.

---

# 17. Empty Documents State

If the student has not uploaded any documents:

```text
No documents yet.

Upload your study material to use
Document-Aware AI Tutor.

[ Upload Document ]
```

The empty state should guide the student toward the next useful action.

---

# 18. Empty Tutor State

When the student opens the AI Tutor without asking a question:

```text
StudyGen AI Tutor

Ask questions about your study material.

Try:

• Explain this topic in simple words.
• Summarize this chapter.
• Give me important exam points.
• Explain this concept with an example.
```

If a document is selected, the interface should mention it.

---

# 19. No Document Selected State

If the student attempts to ask a document-dependent question without selecting a document:

```text
Please select a document first.

Choose a study document from the Documents section
to ask questions about its content.
```

The system should avoid silently using an arbitrary document.

---

# 20. Document Processing States

Document processing may have different states internally.

The user-facing status can be simplified to:

```text
Uploaded
Processing
Ready
Failed
```

Example:

```text
Data Structures Notes.pdf

Status: Ready
```

If processing fails:

```text
Data Structures Notes.pdf

Status: Processing failed

[Try Again]
```

The implementation should only expose states that are actually supported by the backend.

---

# 21. Document Context UX

The student does not need to see the extracted raw document text.

The interface should communicate the concept rather than the implementation.

Preferred:

```text
Using:
📄 Data Structures Notes.pdf
```

Avoid exposing:

```text
Extracted 18,492 characters
Chunk 4 of 12
Embedding generated
Vector ID: ...
```

These are implementation details.

---

# 22. Navigation Design

The feature should integrate with the existing navigation.

Conceptually:

```text
Sidebar

Dashboard
Documents
AI Tutor
Quizzes
Flashcards
Progress
Settings
```

Expected workflow:

```text
Documents
   ↓
Select Document
   ↓
AI Tutor
```

The student should be able to move between Documents and AI Tutor without losing the selected document unnecessarily.

---

# 23. Frontend State

The frontend needs to track at minimum:

```text
documents
selectedDocument
question
messages
loading
error
```

Conceptually:

```javascript
documents
selectedDocument
messages
question
isLoading
error
```

The implementation should follow the existing state-management patterns in the project rather than introducing a new state-management framework.

---

# 24. Backend Request Design

The frontend communicates with FastAPI through HTTP.

Document-aware tutor request:

```http
POST /api/tutor/ask
```

Request:

```json
{
  "document_id": "uuid",
  "question": "Explain this topic."
}
```

Successful response:

```json
{
  "success": true,
  "answer": "..."
}
```

Error response:

```json
{
  "success": false,
  "error": {
    "code": "DOCUMENT_NOT_FOUND",
    "message": "The selected document could not be found."
  }
}
```

The exact response contract should be finalized during implementation planning.

---

# 25. Accessibility

The interface should remain usable for students with different accessibility needs.

The feature should:

* Use readable text.
* Provide visible focus states.
* Use meaningful button labels.
* Avoid relying only on color to communicate status.
* Provide useful error messages.
* Keep interactive elements keyboard accessible.
* Provide appropriate labels for file inputs.
* Maintain sufficient visual contrast using the existing design system.

---

# 26. Responsive Design

The Document-Aware AI Tutor should work across:

```text
Desktop
Laptop
Tablet
Mobile
```

The existing responsive behavior of StudyGen-AI should be preserved.

On smaller screens:

```text
Document Selector
        ↓
Chat
        ↓
Question Input
```

should remain easy to use without horizontal scrolling.

---

# 27. Privacy UX

Documents are private study material.

The interface should avoid unnecessary exposure of document content.

For example:

```text
Using:
📄 Operating Systems Notes.pdf
```

is preferable to displaying large sections of the uploaded document automatically.

The student should explicitly interact with the document through the tutor.

---

# 28. Delete Behavior

When a document is deleted:

```text
Document
   ↓
Delete
   ↓
Backend removes file
   ↓
Frontend removes document from list
```

If the deleted document was selected for the AI Tutor, the selected-document state must be cleared or updated.

The AI Tutor should not continue
