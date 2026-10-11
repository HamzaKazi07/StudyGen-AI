# Security Notes

This document describes controls present in the checked-out code and remaining limitations. It is not a penetration-test report or a production-readiness claim. The automated tests use temporary SQLite/filesystem storage and mock Gemini.

## Authentication, sessions, and authorization

Implemented:

- Registration/login validates email/password input; passwords are hashed with Argon2. The backend never stores plaintext passwords.
- Login returns the same `401` message for an unknown email and a wrong password. A dummy Argon2 verification is performed for unknown emails.
- The backend issues a cryptographically random opaque session credential in an HttpOnly cookie. SQLite stores only its SHA-256 digest, user association, CSRF token, creation time, and a 12-hour expiry. Logout revokes the session.
- Cookie-authenticated state-changing routes require a session-bound `X-CSRF-Token`; login/registration require a configured `Origin`. Credentialed CORS uses configured frontend origins.
- Document list, content, delete, and document-aware tutor queries are filtered by the validated session's owner ID. Client-supplied owner IDs are not accepted. Missing and foreign-owned documents both return `404`.
- Document paths are resolved under their configured storage roots and bound to their document UUID and expected suffix before access or deletion. Delete uses a DB tombstone before file cleanup, so a failed cleanup does not make the record visible again.
- Existing ownerless JSON metadata and files are not imported at startup. The explicit import command requires mapping selected document IDs to existing account emails, validates the full import before the transaction, defaults to dry-run, and leaves source JSON/files in place.

Limitations:

- Registration is open. Email addresses are not verified, password reset/recovery is unavailable, and there are no roles or administrative account controls.
- Auth attempt throttling (10 per client IP per 60 seconds) and tutor throttling (20 per client IP per 60 seconds) are in-memory/per-process. They do not coordinate across workers or hosts and are not a substitute for an edge/WAF control.
- HttpOnly prevents direct JavaScript access to the session cookie but does not prevent authenticated actions from an XSS compromise. CSRF protection does not mitigate XSS.
- Cookies default to `SameSite=Lax`; HTTPS deployments should use `SESSION_COOKIE_SECURE=true`. Cross-site frontend/API deployments require `SESSION_COOKIE_SAMESITE=none` and Secure cookies over HTTPS.
- Only the configured frontend Origin is trusted for auth entrypoints. Reverse proxies, forwarded client IP headers, TLS termination, and production host deployment are not configured by this repository.

## Secrets and environment

- `GEMINI_API_KEY` is backend-only configuration and is required for tutor provider requests. The application can start without it and returns a safe tutor configuration error. Do not put it in a `VITE_*` variable, frontend file, or source control.
- No static session-signing secret is required: sessions are opaque random values persisted by digest in SQLite. Protect the SQLite database and backups because they contain password hashes, session digests, CSRF values, and account metadata.
- `VITE_API_URL` is browser-visible and must not contain credentials.
- `.gitignore` excludes `.env` files (except `.env.example`), backend upload data, the SQLite data directory, virtual environments, node modules, and build output. Local `.env` values were not inspected or reproduced for this implementation.

## Upload validation and storage

Implemented:

- Backend accepts `.pdf`, `.docx`, and `.txt`; a supplied multipart content type must be from the allowed PDF/DOCX/TXT set.
- The upload handler reads in 1 MiB chunks and enforces a 20 MiB application-level maximum.
- Physical filenames are server-generated UUID names; the client filename is display metadata.
- Storage paths validate the UUID and generated filename, reject path traversal and symbolic links, and resolve within the configured storage root. Original files are created exclusively; extracted text is written to a unique temporary file and atomically installed without overwriting an existing destination.
- The backend extracts text to a separate local file. Metadata (including owner ID) is inserted transactionally only after extraction succeeds. Upload files and SQLite metadata are separate resources: upload failure triggers operation-scoped cleanup, but a process crash or cleanup failure can leave orphaned files. If the filesystem refuses removal of the unique staging file after installation, the installed document file is cleaned up, but a hidden `.tmp` staging artifact may remain for manual cleanup; the API reports that cleanup could not be confirmed.
- Delete first hides the owner-scoped row with a tombstone, validates generated file references, attempts removal of both files, then deletes the row only when all file removals succeed. Missing files are handled idempotently. On a partial file-removal failure, the tombstoned row remains for retry; some files may already be gone while others remain. SQLite and filesystem operations cannot be committed atomically, so a crash after file removal but before row deletion can also leave tombstoned metadata without files.

Remaining gaps:

- Extension and client-declared MIME checks do not inspect file signatures. Malware scanning, OCR, archive/decompression-bomb protections, and upload-specific rate limiting are absent.
- PDF/DOCX parsing is synchronous and has no explicit CPU, memory, or per-file processing timeout.
- SQLite metadata and document/extracted-text files are plaintext on the local host. Encryption-at-rest, centralized storage, retention/secure erasure, automated backup, and restore drills are not implemented.
- The application-level size check runs while reading the upload; no reverse-proxy/server request-body cap is configured in the repository.
- The old JSON archive is preserved but not automatically exposed to any account. The CLI import changes SQLite metadata only; review mappings and back up the database and files first.

## Request limits, tutor context, and prompt injection

- Tutor question length is 1–4,000 characters by schema; whitespace-only questions are rejected.
- History is truncated to the latest 20 messages for provider use, but individual history item sizes and the total request body do not have application-specific limits.
- Selected document context is bounded to the first 12,000 characters. The tutor prompt receives explicit complete-extracted-text versus partial-excerpt status and instructs the model not to claim that an excerpt represents unseen content. Additive SSE start metadata reports the truncation flag and supplied/total extracted-character counts; the UI warns when the context is partial.
- The prompt tells the model to distinguish explicitly implemented/completed features from proposals, plans, and unverified implementation status; identify conflicting statements; use section/page references only when supplied text makes them reliable; and label helpful general knowledge separately from document-derived facts. These are instructions to a probabilistic provider, not a factuality guarantee, deterministic contradiction detector, source-code verification, or citation validation.
- Document text is passed as bounded untrusted evidence, separate from the provider system instruction. Prompt wording reduces neither all prompt-injection risk nor malicious-output risk; uploaded text can still influence the model. No embeddings, chunk retrieval, or citations are implemented, so the first excerpt can omit relevant later passages.
- Document-aware question text and extracted document content are sent to Google Gemini. Do not use sensitive documents without reviewing provider data-handling terms.
- The browser uses `AbortController` when leaving the Tutor page. Server/provider cancellation, provider timeouts, and retries are not implemented or verified.

## CORS, authentication status, and error handling

- CORS is configured for `FRONTEND_URL`; local Vite origin variants are allowed when the configured URL is a local origin. Credentialed CORS is enabled, but this is not itself authentication.
- Root, health, Dashboard, Quizzes, Flashcards, and general AI Tutor requests are public. Auth routes are public for registration/login. Document routes, personal Progress/Settings pages, and document-aware tutor requests require a session; document-aware tutor and other mutations additionally require CSRF. The backend checks ownership before document reads.
- API errors do not return password hashes, session IDs, or document text. Document, auth-storage, and Gemini failures use safe client messages; tutor/provider logs include the exception class but not exception details that could echo submitted content or provider request data.
- The health response does not verify Gemini availability, and no deployment TLS configuration is present.

## Known security and reliability gaps

These are implementation gaps, not claims that a specific exploit was demonstrated:

1. Add email verification and secure account-recovery/reset flows before relying on account ownership tied to email.
2. Move auth/tutor rate limiting to a shared durable service for multi-worker deployments and apply controls at the edge.
3. Configure HTTPS, secure cookies, exact production CORS origins, proxy trust/IP policy, and deployment request-size/time limits.
4. Add file signature validation, malware scanning, resource/time limits, and robust document-format fuzzing.
5. Define encrypted backups, retention, restore testing, and storage monitoring for SQLite and files.
6. Evaluate prompt-injection and model output behavior with controlled live-provider tests; prompt instructions and mocked output cannot prove model compliance, and no live Gemini request was made.
7. Add browser-level tests for login/logout, session expiry redirects, cross-origin cookie behavior, and cancellation of active streaming responses.

See [API](./API.md), [Architecture](./ARCHITECTURE.md), and [Environment](./ENVIRONMENT.md) for route, flow, and configuration details.
