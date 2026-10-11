# StudyGen AI

StudyGen AI is a React and FastAPI study-assistant prototype. It now includes email/password accounts, expiring server-side sessions, and per-user document access, alongside local document extraction and a Gemini-backed tutor. The quiz, flashcard, progress, dashboard, and settings experiences remain primarily UI prototypes.

This README describes the checked-out implementation, not planned functionality. See the [feature inventory](docs/FEATURES.md) for status and evidence.

## Current features

| Area | Current status |
| --- | --- |
| Accounts and document authorization | Registration, login/logout, HttpOnly sessions, CSRF checks, and backend owner-scoped document routes are implemented. Emails are not verified; password recovery is unavailable. |
| Dashboard and page navigation | Navigation works; dashboard values and recent-document cards are sample UI. |
| Documents | Authenticated PDF/DOCX/TXT upload, extraction, per-user metadata listing, content retrieval, and deletion. SQLite metadata and local files; ownerless legacy JSON/files are not exposed unless explicitly mapped. |
| AI Tutor | General questions are public; document-context requests require authentication and ownership. Response text streams to the browser with SSE. Live Gemini behavior was not verified. |
| Quizzes | UI prototype; the Generate Quiz action displays an alert and does not generate or save a quiz. |
| Flashcards | Four hard-coded cards can be browsed; the generator displays an alert. |
| Progress | Displays static sample metrics and activity; no tracking or persistence is implemented. |
| Settings | Some preference controls update local component state; no account or preference persistence exists. |

## Technology

| Layer | Implementation |
| --- | --- |
| Frontend | JavaScript, React 19, Vite 8, React Router 7, Tailwind CSS 4, `react-markdown` |
| Backend | Python, FastAPI, Uvicorn, Pydantic 2 |
| AI | Google GenAI Python client; configured model name `gemini-3.5-flash-lite` |
| Document extraction | `pypdf` for PDF, `python-docx` for DOCX, Python UTF-8 file reading for TXT |
| Persistence | SQLite for users, sessions, and owned document metadata; local uploaded/extracted files. The old JSON metadata is retained only as a legacy archive. |
| Authentication | Argon2 password hashes, opaque HttpOnly session cookies, CSRF protection, and SQLite-backed session expiry |

The locked Vite 8.2.1 package requires Node.js `^20.19.0` or `>=22.12.0`. The local versions observed during this audit were Python 3.13.2, Node.js 22.23.3, and npm 11.6.3; these are audit-machine versions, not a broader compatibility certification. Python 3.10 or later is needed for syntax used by the backend.

## Architecture at a glance

```text
Browser (React)
   │ Credentialed HTTP JSON / multipart; tutor response is SSE
   ▼
FastAPI (backend/main.py)
   ├── /api/auth → SQLite users + expiring sessions
   ├── /api/documents → owner-scoped SQLite metadata + local files
   └── /api/tutor/ask → public general questions / owner-checked document context → Gemini API
```

SQLite schema migrations run at backend startup. Existing `documents.json` records and files remain preserved but inaccessible through normal API operations; they require an explicit owner mapping to an already registered account. See [Architecture](docs/ARCHITECTURE.md) for request flows, storage lifecycle, migration, and limitations.

## Repository structure

```text
StudyGen-AI/
├── .github/                    # repository instructions and agent skills
├── .specify/                   # specification workflow templates/scripts
├── .claude/                    # local agent tooling
├── .gemini/                    # local agent tooling
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── requirements.txt
│   ├── migrations/
│   │   └── 001_identity_and_documents.sql
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── documents.py
│   │   └── tutor.py
│   ├── services/
│   │   ├── ai_service.py
│   │   └── auth.py
│   ├── scripts/
│   │   └── import_legacy_documents.py
│   └── tests/
│       └── test_document_tutor.py
├── database/                   # currently empty; runtime DB is under backend/data/
├── docs/
│   ├── .env.example
│   ├── API.md
│   ├── ARCHITECTURE.md
│   ├── DECISIONS.md
│   ├── DESIGN.md
│   ├── DEVELOPMENT.md
│   ├── ENVIRONMENT.md
│   ├── FEATURES.md
│   ├── MEMORY.md
│   ├── PRD.md
│   ├── RULES.md
│   ├── SECURITY.md
│   ├── TASKS.md
│   ├── TEST_PLAN.md
│   └── TESTING.md
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   ├── eslint.config.js
│   ├── public/
│   └── src/
│       ├── App.jsx
│       ├── auth/
│       ├── lib/
│       ├── components/
│       ├── pages/
│       ├── assets/
│       ├── App.css
│       ├── index.css
│       └── main.jsx
├── graft/                      # generated context graph; Git-ignored
├── specs/
│   └── 001-document-aware-ai-tutor/
│       ├── checklists/
│       └── spec.md
├── .gitignore
├── .ignore
├── .mcp.json
├── AGENTS.md
├── GEMINI.md
└── README.md
```

At runtime, the backend creates `backend/data/studygen.sqlite3`, `backend/uploads/documents/`, and `backend/uploads/processed/`. The existing `backend/uploads/documents.json`, when present, is retained as an ownerless legacy archive and is not loaded into active API state. Runtime database/upload files are ignored by Git.

## Setup (Windows PowerShell)

### 1. Configure the backend

From the repository root:

```powershell
Set-Location .\backend
py -3 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

Create `backend\.env` locally:

```dotenv
GEMINI_API_KEY=replace-with-your-own-private-key
FRONTEND_URL=http://localhost:5173
STUDYGEN_DATABASE_PATH=./data/studygen.sqlite3
SESSION_COOKIE_SECURE=false
SESSION_COOKIE_SAMESITE=lax
```

The placeholder is not a working key. The backend can start without `GEMINI_API_KEY`, but AI Tutor requests will return a safe SSE configuration error until a valid key is configured.

### 2. Configure the frontend

From the repository root in another terminal:

```powershell
Set-Location .\frontend
npm ci
```

Create `frontend\.env.local` locally:

```dotenv
VITE_API_URL=http://localhost:8000
```

Never put a Gemini key in a `VITE_*` variable or frontend file. Full variable descriptions and defaults are in [Environment Configuration](docs/ENVIRONMENT.md).

### 3. Start both services

Backend terminal:

```powershell
Set-Location .\backend
.\.venv\Scripts\python.exe -m uvicorn main:app --reload
```

Frontend terminal:

```powershell
Set-Location .\frontend
npm run dev
```

Vite normally serves at `http://localhost:5173`; the API defaults to `http://localhost:8000`. The matching hostname is needed for the local `SameSite=Lax` session cookie. FastAPI's interactive API documentation is available at `http://localhost:8000/docs`. Backend startup initializes the SQLite schema. Create an account at `/register`; email verification and password recovery are not implemented.

## API overview

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/` | Basic service message |
| `GET` | `/health` | Basic process health response |
| `POST` | `/api/auth/register` | Create account and session |
| `POST` | `/api/auth/login` | Authenticate and create session |
| `GET` | `/api/auth/me` | Read current user and CSRF token |
| `POST` | `/api/auth/logout` | Revoke current session |
| `POST` | `/api/documents/upload` | Upload and process a PDF, DOCX, or TXT |
| `GET` | `/api/documents` | List document metadata |
| `GET` | `/api/documents/{document_id}/content` | Return extracted text |
| `DELETE` | `/api/documents/{document_id}` | Delete a document |
| `POST` | `/api/tutor/ask` | Ask the tutor and receive an SSE stream |

Document operations require a session; state-changing requests also require CSRF. General tutor questions are public, while document-aware tutor requests require a session, CSRF token, and document ownership. There is no standalone document-by-ID metadata route. See [API Reference](docs/API.md) for fields, validation, response examples, and error behavior.

## Document-aware tutor flow

1. Upload a PDF, DOCX, or TXT (up to 20 MiB); the backend extracts readable text and stores it under a generated filename.
2. Metadata and owner ID are committed to SQLite after extraction; extracted text is stored separately as a UUID-named `.txt` file.
3. Select **Ask AI** for a processed item. The frontend navigates to `/ai-tutor?document_id=...` and checks the current document list.
4. Ask a general question without signing in, or sign in to select a document. Document-aware tutor requests send the question, up to 20 prior messages, selected document ID, session cookie, and CSRF token to `/api/tutor/ask`; the backend checks ownership before reading document text.
5. The backend confirms the document belongs to the authenticated account before sending up to the first 12,000 characters of extracted text to Gemini as untrusted evidence. If the extracted text is longer, the SSE start event and tutor UI identify the context as a partial excerpt; answers may not cover later content.
6. The backend emits `start`, `chunk`, and `done` SSE events; an upstream error after streaming begins is sent as an `error` event.

The prompt asks Gemini to treat document content as data and say when an answer is not supported. This prompt is not a guarantee of model behavior. The feature does not use embeddings, chunk retrieval, citations, or a live-provider verification suite.

## Tests and checks

From `backend/`:

```powershell
.\.venv\Scripts\python.exe -m unittest discover -s tests -v
```

From `frontend/`:

```powershell
npm test
npm run lint
npm run build
```

Authentication navigation regression tests run with Vitest and mock API responses. The backend suite uses mocked Gemini streaming. Neither suite performs a real browser/API session flow or a live provider request. See [Testing](docs/TESTING.md) for test coverage and verification gaps.

## Security and limitations

- Authentication and per-user ownership checks are implemented, but open registration has no email verification or password recovery. Auth and tutor rate limiting is process-local.
- SQLite and local filesystem storage are tied to one backend host and are not automatically backed up or shared across hosts.
- Upload extension, declared MIME type, and application size checks exist, but file signatures are not verified. Uploads are parsed synchronously.
- Tutor input has a 4,000-character question limit, 20-message history truncation, and an in-memory 20 requests per 60 seconds per client-IP limiter. This limiter is process-local.
- CORS and cookie settings have local defaults; HTTPS, production deployment configuration, and recovery drills remain operator responsibilities.
- Gemini is an external processor: selected document text is sent to the configured provider for document-aware answers.

See [Security](docs/SECURITY.md) for verified controls and code-level gaps. Never commit `.env` files, API keys, or uploaded study documents.

## Further documentation

- [Architecture](docs/ARCHITECTURE.md)
- [API reference](docs/API.md)
- [Feature inventory and status](docs/FEATURES.md)
- [Development guide](docs/DEVELOPMENT.md)
- [Security review notes](docs/SECURITY.md)
- [Testing and verification](docs/TESTING.md)
- [Environment variables](docs/ENVIRONMENT.md)
- [Document-aware tutor specification](specs/001-document-aware-ai-tutor/spec.md)
