# Testing and Verification

## Automated backend tests

The backend uses Python `unittest` and FastAPI `TestClient`. Run from `backend/`:

```powershell
.\.venv\Scripts\python.exe -m unittest discover -s tests -v
```

The complete backend suite currently runs 51 tests (one skipped because symlink creation is unavailable in the test environment). The focused document-storage suite runs 12 tests (the same symlink test is skipped). Tests use temporary SQLite and document directories; Gemini streaming is mocked, and no live provider key or request is needed.

Coverage includes:

- Protected-route unauthenticated rejection and CSRF enforcement.
- Anonymous general tutor access, anonymous document-aware tutor denial, and CSRF enforcement for document-context requests.
- Auth registration, duplicate and invalid/malformed credentials, disallowed Origin, logout, HttpOnly cookie issuance, hashed session storage, and expired-session rejection.
- Own-document upload/read, owner-scoped listing, foreign-user content/delete/tutor denial, and missing/unprocessed/unavailable/empty document cases.
- General and document-aware tutor behavior, SSE start/chunk/done/error responses, mocked provider composition for facts/proposals/unverified implementation/contradictions/missing evidence/excerpt scope, context length boundary, and prompt-injection-like document text handling.
- Isolated document-storage tests use temporary directories and SQLite to check UUID/filename validation, traversal and symlink rejection (where supported), no-overwrite atomic text installation, staging-file cleanup failure, upload transaction rollback/cleanup, source and processed-file deletion failures with tombstone retry, missing files/metadata, and protection of unrelated files.
- Upload/auth storage failure handling and cleanup, transactional migration rollback, dry-run/explicit legacy import, and rejected mapping without partial inserts.

One Starlette `TestClient` deprecation warning about the installed `httpx` integration is emitted by the existing environment. The tests do not use a live browser and do not prove provider-side cancellation.

## Frontend tests and checks

The frontend uses Vitest and Testing Library for auth navigation and session-restoration regression coverage. Run from `frontend/`:

```powershell
npm test
npm run lint
npm run build
```

The component tests mock backend responses and verify public Dashboard/general Tutor use, public Quizzes and Flashcards navigation, protected Documents redirection with return destination, Dashboard-to-Documents navigation, session restoration after app remount, expired-session handling, document-aware tutor login gating, partial-excerpt notice, abort-on-navigation behavior, distinct API restoration errors, and API URL alignment for loopback hosts. They do not exercise a real browser cookie jar or a live API. ESLint checks source rules; the Vite build checks production bundling.

## Results executed for the current tutor-grounding change

| Check | Actual result |
| --- | --- |
| Backend `unittest` from `backend/` | 39 tests passed. |
| `npm test` from `frontend/` | 13 tests passed across 2 files. |
| `npm run lint` from `frontend/` | Passed. |
| `npm run build` from `frontend/` | Passed with Vite 8.2.1. |
| FastAPI import + `app.openapi()` | Passed; 11 paths generated, including `/api/tutor/ask`. |
| `git diff --check` | Passed. |

Backend cases mock provider output and verify evidence/request pass-through for explicitly stated facts, proposed features, unverified implementation, contradictions, absent information, truncated context, and injection-like text. They also verify SSE metadata and safe provider-error handling. These tests verify application plumbing and policy prompts, not that a live model will produce accurate answers. Frontend API responses and SSE streams are mocked. No test made a live Gemini request or exercised a real browser cookie jar; those remain unverified.

## Manual browser checklist

These are follow-up checks, not results claimed as completed:

1. Start API and Vite with the documented local host settings; visit `/register`, create an account, refresh, and verify the session is restored.
2. Sign out and verify protected routes redirect to `/login`; sign in again and check the signed-in email in the top bar.
3. Upload a small TXT document. Verify it appears in the current account's list, retrieve it through the app, tutor with it, and delete it.
4. In a separate browser profile, create a second account. Verify its list is empty and a copied first-account document ID cannot be retrieved, deleted, or submitted to the tutor.
5. Omit/alter the CSRF token in developer tools and verify state-changing requests fail with `403`. Expire the session in a test database and verify the frontend returns to sign-in.
6. Ask a general tutor question and a document-aware question with a test-only Gemini key; verify incremental SSE rendering and navigate away during a response to confirm the browser abort behavior.
7. Use a document longer than 12,000 extracted characters and verify the tutor shows the partial-context notice. Ask about a fact near the beginning and one near the end; confirm the answer discloses that unseen text was not examined when relevant.
8. With a controlled live-provider test document, check explicit facts, planned versus completed features, source-verification caveats, internal contradictions, missing information, and prompt-injection-like content. These behaviors are not guaranteed by mocked tests.
9. Test HTTPS cookie configuration in the intended deployment topology, especially cross-site `SameSite=None` with Secure cookies.
10. If recovering legacy documents, test with backups and a non-sensitive mapping. Run the CLI dry-run first; inspect account ownership and files before `--apply`.

## Untested/partially tested behavior

- PDF/DOCX extraction, malformed files, actual MIME spoofing, file signature checks, upload-size boundaries, parser exhaustion, and path-tampering scenarios do not have full integration/fuzz coverage.
- Browser account UX, accessibility, CORS/cookie deployment topologies, frontend session-expiry redirects, and end-to-end stream cancellation have no automated tests.
- SQLite concurrency under multiple workers/hosts, production backup/restore, filesystem cleanup crash recovery, and legacy imports against real user data have not been exercised.
- No live Gemini availability, model entitlement, latency, cost, output quality, or prompt-injection behavior was verified.
- Static sample features (dashboard metrics, quiz generation, flashcard generation, progress tracking, and settings persistence) are not tested as backend functionality because those implementations do not exist.
