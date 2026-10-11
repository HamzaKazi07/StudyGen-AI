# StudyGen AI API

This reference follows the FastAPI route registrations and request models in `backend/main.py` and `backend/routes/`. The default local API base URL is `http://localhost:8000`.

## Authentication and request conventions

- `GET /` and `GET /health` are public. Registration and login are public but require an `Origin` exactly matching a configured allowed frontend origin.
- All document operations require a valid session cookie; mutations also require `X-CSRF-Token`. `POST /api/tutor/ask` is public for general questions. Supplying `document_id` requires a valid session, CSRF token, and ownership of that document.
- The session cookie is HttpOnly; clients must use `credentials: "include"`. Do not copy the session cookie into JavaScript storage or request URLs.
- CORS allows the configured `FRONTEND_URL`. When it is one of the local Vite origins, both `localhost:5173` and `127.0.0.1:5173` are allowed. Credentialed requests are enabled.
- FastAPI validation errors use `{"detail":[...]}`; application errors use `{"detail":"..."}`.
- No API request accepts an owner/user ID. The backend derives identity from the validated session.

## Endpoint index

| Method | Path | Purpose | Authentication |
| --- | --- | --- | --- |
| `GET` | `/` | Basic service message | Public |
| `GET` | `/health` | Basic process health response | Public |
| `POST` | `/api/auth/register` | Create account and session | Public; allowed `Origin` |
| `POST` | `/api/auth/login` | Authenticate and create session | Public; allowed `Origin` |
| `GET` | `/api/auth/me` | Return current user and session CSRF token | Session cookie |
| `POST` | `/api/auth/logout` | Revoke session | Session cookie + CSRF |
| `POST` | `/api/documents/upload` | Upload and extract a document | Session cookie + CSRF |
| `GET` | `/api/documents` | List current user's documents | Session cookie |
| `GET` | `/api/documents/{document_id}/content` | Read current user's extracted text | Session cookie |
| `DELETE` | `/api/documents/{document_id}` | Delete current user's document | Session cookie + CSRF |
| `POST` | `/api/tutor/ask` | Ask tutor; returns SSE | Public without `document_id`; session + CSRF + ownership with `document_id` |

There is no `GET /api/documents/{document_id}` metadata endpoint. FastAPI also exposes its generated `/docs`, `/redoc`, and `/openapi.json` routes.

## `GET /` and `GET /health`

Both are public and do not verify Gemini availability. Root returns `{"message":"StudyGen API is running"}`; health returns `{"status":"ok"}`. The database schema is initialized at application startup, but `/health` does not perform a live dependency/readiness check.

## `POST /api/auth/register`

Creates an account and a 12-hour session. Email is normalized to lowercase. Email addresses are not verified; password recovery is not implemented.

**Headers:** `Origin` must match an allowed frontend origin.

**JSON request**

```json
{
  "email": "learner@example.com",
  "password": "fictional-passphrase-123"
}
```

`email` is required and validated as an email address. `password` is required and must be 12–128 characters.

**Success — `201 Created`**

```json
{
  "user": {
    "id": "7d9195bf-4dd6-46fc-b8d5-c81500d50301",
    "email": "learner@example.com"
  },
  "csrf_token": "fictional-session-csrf-token"
}
```

A random HttpOnly `studygen_session` cookie is set. The session credential itself is stored in SQLite only as a SHA-256 digest; the response CSRF value is associated with the session and must be sent in `X-CSRF-Token` on state-changing authenticated requests.

**Errors:** `403` disallowed/missing Origin; `409` email already registered; `422` invalid email/password; `429` auth-attempt limit; `503` authentication storage/hash operation unavailable.

## `POST /api/auth/login`

Authenticates by email and password. `email` is required and validated; `password` is required, 1–128 characters. The response/cookie structure matches registration.

**Errors:** `401` invalid credentials (same message for unknown email and wrong password); `403` disallowed/missing Origin; `422` malformed request; `429` auth-attempt limit; `503` authentication service/storage unavailable.

## `GET /api/auth/me`

Requires a valid session cookie. Returns the authenticated user's public identity and that session's CSRF token:

```json
{
  "user": {
    "id": "7d9195bf-4dd6-46fc-b8d5-c81500d50301",
    "email": "learner@example.com"
  },
  "csrf_token": "fictional-session-csrf-token"
}
```

**Errors:** `401` missing, malformed, unknown, or expired session; `503` session storage unavailable.

## `POST /api/auth/logout`

Requires the session cookie and `X-CSRF-Token`. Success revokes the server-side session and clears the cookie:

```json
{"success": true}
```

**Errors:** `401` invalid/expired session; `403` missing/invalid CSRF token; `503` storage unavailable. If revocation fails, the API does not report success.

## `POST /api/documents/upload`

Requires session cookie and `X-CSRF-Token`. Sends one `multipart/form-data` field named `file`.

- Accepted extensions: `.pdf`, `.docx`, `.txt` (case-insensitive).
- If supplied, declared MIME must be PDF, DOCX, or plain text.
- Application-level maximum payload: 20 MiB.
- Extraction is synchronous; an empty extracted document is rejected.
- Original and processed files use server-generated UUID-based names. Metadata and owner are committed together in SQLite after files are written and processed.

**Success — `200 OK`**

```json
{
  "success": true,
  "message": "Document uploaded and processed successfully.",
  "document": {
    "id": "11111111-2222-4333-8444-555555555555",
    "name": "biology-notes.txt",
    "filename": "11111111-2222-4333-8444-555555555555.txt",
    "type": "TXT",
    "size": 32,
    "size_mb": 0.0,
    "status": "Processed",
    "uploaded_at": "2026-10-11T09:30:00",
    "processed": true,
    "text_length": 32,
    "processed_filename": "11111111-2222-4333-8444-555555555555.txt",
    "processed_at": "2026-10-11T09:30:00"
  }
}
```

The response does not include `owner_id`. Timestamps are generated by local `datetime.now()` and have no timezone marker.

**Errors:** `400` missing name, unsupported extension, or invalid declared MIME; `401` missing/invalid session; `403` CSRF failure; `413` over 20 MiB; `422` request validation or extraction/empty text failure; `503` database/filesystem failure (with cleanup status reflected in the safe message); `500` processing failure when cleanup completed.

## `GET /api/documents`

Requires session cookie. Returns only active rows with `owner_id` equal to the authenticated user. Extracted text and owner IDs are not included.

**Success — `200 OK`**

```json
{
  "success": true,
  "documents": [
    {
      "id": "11111111-2222-4333-8444-555555555555",
      "name": "biology-notes.txt",
      "filename": "11111111-2222-4333-8444-555555555555.txt",
      "processed_filename": "11111111-2222-4333-8444-555555555555.txt",
      "type": "TXT",
      "size": 32,
      "status": "Processed",
      "uploaded_at": "2026-10-11T09:30:00",
      "processed": true,
      "text_length": 32,
      "processed_at": "2026-10-11T09:30:00",
      "size_mb": 0.0
    }
  ]
}
```

**Errors:** `401` missing/invalid session; `503` database unavailable.

## `GET /api/documents/{document_id}/content`

Requires session cookie. `document_id` is a string matched together with the authenticated owner ID. An absent or foreign-owned ID both return `404`, so the route does not reveal another user's document existence. Processed text is read only after checking the persisted filename against the generated document ID and storage root.

**Success — `200 OK`**

```json
{
  "success": true,
  "document_id": "11111111-2222-4333-8444-555555555555",
  "name": "biology-notes.txt",
  "text": "Plant cells contain a cell wall.",
  "text_length": 32
}
```

**Errors:** `401` missing/invalid session; `404` absent/unowned document or missing/unsafe file; `409` document not processed; `422` empty extracted text when used by the tutor; `503` database/filesystem read unavailable.

## `DELETE /api/documents/{document_id}`

Requires session cookie and `X-CSRF-Token`. Only the owner's row can be tombstoned or deleted. The API first marks it deleted transactionally (hiding it from list/content/tutor), then safely removes the UUID-bound files, then removes the row. A failed cleanup/final database operation returns an error; retrying deletion can finish cleanup.

**Success — `200 OK`**

```json
{
  "success": true,
  "message": "Document and processed content deleted successfully."
}
```

**Errors:** `401` missing/invalid session; `403` CSRF failure; `404` absent/unowned document; `503` database or file cleanup failure.

## `POST /api/tutor/ask`

General tutoring is public and does not require a session or CSRF token. If `document_id` is supplied, the request requires a valid session cookie and `X-CSRF-Token`; the tutor performs an owner-scoped database lookup and safely reads that owner's processed text before creating the stream.

**JSON request**

```json
{
  "question": "What is the main idea?",
  "history": [
    {"role": "user", "text": "I am reviewing cell biology."},
    {"role": "assistant", "text": "We can work through it together."}
  ],
  "document_id": "11111111-2222-4333-8444-555555555555"
}
```

- `question`: required string, 1–4,000 characters before whitespace trimming; whitespace-only input returns `400`.
- `history`: optional array of `{ "role": string, "text": string }`, default `[]`; only the latest 20 messages are used by the provider request. Individual history text and total request body size have no additional application-specific bounds.
- `document_id`: optional string or `null`; must identify a processed document owned by the current user.
- No query parameters.

**Success — `200 OK`, `Content-Type: text/event-stream`**

```text
event: start
data: {"success":true,"document_id":"11111111-2222-4333-8444-555555555555","document_name":"biology-notes.txt","document_context_truncated":false,"document_context_chars":8240,"document_extracted_chars":8240}

event: chunk
data: {"text":"The main idea is that plant cells have a cell wall."}

event: done
data: {"success":true}
```

General tutor `start` events omit document fields. For document-aware requests, `document_context_truncated` indicates whether the extracted text exceeds the 12,000-character limit; `document_context_chars` is the supplied context length, and `document_extracted_chars` is the total extracted-text length. The backend sends the first 12,000 characters when truncated, and the frontend displays a notice that later content may not be covered. The prompt distinguishes a complete extracted-text context from a partial excerpt. If the provider fails after stream start, an `error` SSE event is sent while the HTTP status remains `200`.

Document-aware prompting asks Gemini to ground answers in the supplied text, distinguish implemented claims from proposals or unverified status, call out contradictions, avoid inventing section/page references, and label useful external knowledge. These are model instructions, not guaranteed classifications or citations. Prompt-injection-like document content remains untrusted input; the instructions mitigate but cannot guarantee against prompt injection.

**Errors before streaming:** document-aware requests return `401` for missing/expired session and `403` for CSRF failure; any request can return `400` for a blank question, `422` for request validation, and `429` for the tutor IP limit (20 requests per 60 seconds per process). Document-aware requests can additionally return `404` for an unknown/unowned document or missing content, `409` for an unprocessed document, and `503` for storage/read failure. Provider/configuration failures after stream start are reported through a safe SSE `error` event with HTTP `200`.

## Explicit legacy owner import

Existing `documents.json` records are not automatically copied or assigned. They remain outside normal API access. To associate selected legacy files with already registered users, prepare an owner mapping JSON:

```json
{
  "documents": [
    {
      "document_id": "11111111-2222-4333-8444-555555555555",
      "owner_email": "learner@example.com"
    }
  ]
}
```

From `backend/`, run the command first without `--apply` to validate the full mapping and files. Only after reviewing the result, repeat with `--apply`. The import is database-transactional; it does not rewrite the legacy JSON or move/delete files. See [Development](./DEVELOPMENT.md) for PowerShell commands and backup notes.
