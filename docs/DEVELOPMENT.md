# Development Guide

## Prerequisites

- Windows PowerShell and Git.
- Python 3.10 or later (the code uses Python 3.10 union-type syntax). The audited local backend virtual environment used Python 3.13.2.
- Node.js `^20.19.0` or `>=22.12.0`, required by the locked Vite 8.2.1. The audited environment used Node 22.23.3 and npm 11.6.3.
- A private Gemini API key for live tutor responses. The automated backend tests mock provider calls.

## Install dependencies

From the repository root, create and populate the backend virtual environment:

```powershell
Set-Location .\backend
py -3 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

Install the locked frontend dependency tree:

```powershell
Set-Location ..\frontend
npm ci
```

No application package installation is required beyond these manifests. There is no root-level package manager workspace.

## Configure local environments

Create `backend\.env` and `frontend\.env.local` using the placeholder examples in [Environment Configuration](./ENVIRONMENT.md). Keep the real Gemini key only in backend process configuration. `.gitignore` excludes `.env` and `.env.*` except `.env.example`.

For local HTTP development, use `FRONTEND_URL=http://localhost:5173`, `SESSION_COOKIE_SECURE=false`, and `SESSION_COOKIE_SAMESITE=lax`. `VITE_API_URL` is optional: its Vite default follows the frontend hostname, and explicit HTTP loopback API URLs are aligned to it, so `localhost` and `127.0.0.1` remain consistent for session cookies. In production, configure HTTPS, set `SESSION_COOKIE_SECURE=true`, and set an exact `FRONTEND_URL`; configure `VITE_API_URL` when the API is not served from the frontend origin. Use `SESSION_COOKIE_SAMESITE=none` only if the frontend and API are cross-site and both use HTTPS.

## Run the applications

Start the API in a PowerShell terminal:

```powershell
Set-Location .\backend
.\.venv\Scripts\python.exe -m uvicorn main:app --reload
```

Start Vite in a second terminal:

```powershell
Set-Location .\frontend
npm run dev
```

The default local URLs are the Vite development server (`http://localhost:5173`) and the API (`http://localhost:8000`). The API applies SQLite schema migrations at startup and creates `backend/data/studygen.sqlite3` by default. FastAPI's interactive docs are at `http://localhost:8000/docs`.

Create an account at `/register`, then sign in at `/login`. Passwords must be 12–128 characters. Account emails are not verified, and password recovery is not available.

## Checks

Backend unit tests (run from `backend/`):

```powershell
.\.venv\Scripts\python.exe -m unittest discover -s tests -v
```

Frontend tests, lint, and production build (run from `frontend/`):

```powershell
npm test
npm run lint
npm run build
```

`npm run preview` serves the built frontend locally. Vitest and Testing Library run the auth/navigation component regression tests. There is no configured formatter, type checker, CI workflow, Docker setup, or deployment command in this repository.

## Adding a frontend page

1. Add a page component under `frontend/src/pages/`.
2. Import and register it in `frontend/src/App.jsx`. Main app routes are authenticated by the shared layout; login and registration remain public.
3. Add a matching link in `frontend/src/components/Sidebar.jsx` if it belongs in primary navigation.
4. Use `frontend/src/lib/api.js` (`apiFetch`) for backend calls so cookies, CSRF headers, and expired-session handling remain consistent. Do not put session credentials in local storage or log them.
5. Run `npm test`, `npm run lint`, and `npm run build`; verify the page manually in a browser.

## Adding a backend endpoint

1. Add the route and Pydantic request model in the relevant module under `backend/routes/`.
2. Register its router in `backend/main.py` if it is a new router.
3. For user data, derive identity through `get_current_user` or `require_csrf`; never accept an owner ID from the request. Add ownership predicates to every read/write query.
4. Add schema changes as a sequential SQL migration under `backend/migrations/`; SQLite `user_version` is the schema version. Do not modify an existing migration after it has been applied to a user's database.
5. Keep provider-specific code in `backend/services/ai_service.py` rather than embedding Gemini calls in a route.
6. Return explicit HTTP errors for failures and document streaming event behavior where applicable.
7. Add `unittest` coverage in `backend/tests/`; mock external provider calls and use temporary SQLite/filesystem paths.
8. Run the backend test command above.

## Legacy document recovery

The old `backend/uploads/documents.json` and files are preserved but not exposed to authenticated accounts. To map selected documents to users who have already registered:

1. Make a backup of the SQLite database, legacy JSON, and both upload directories while the backend is stopped.
2. Create a mapping file outside source control, for example `legacy-owner-mapping.json`:

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

3. From `backend/`, validate without changing data:

   ```powershell
   .\.venv\Scripts\python.exe -m scripts.import_legacy_documents --mapping ..\legacy-owner-mapping.json
   ```

4. Review the mapping, confirm each owner and file, then rerun with `--apply` to commit the ownership records. The command does not move/delete source files or edit the legacy JSON.

## Troubleshooting

- **AI Tutor reports it is not configured:** add a valid `GEMINI_API_KEY` to the backend environment and restart the API. The rest of the application can start without the key.
- **Browser cannot reach API / CORS or session-cookie error:** check that `VITE_API_URL` and the Vite page use the same local hostname (`localhost` by default), check `FRONTEND_URL`, and restart Vite after environment changes. For cross-site HTTPS deployments, configure Secure cookies and `SESSION_COOKIE_SAMESITE=none`.
- **Repeated sign-in redirect:** confirm backend startup completed SQLite migrations, keep cookies enabled, and verify the browser is sending credentials. State-changing API requests also require the in-memory CSRF token managed by `apiFetch`.
- **Session expires:** sessions last 12 hours; sign in again. There is no refresh-token endpoint or password-reset flow.
- **Upload is rejected:** use a `.pdf`, `.docx`, or `.txt` file under 20 MiB. For non-empty uploads, a supplied MIME type must also match an allowed value.
- **Tutor request returns `429`:** the in-memory limit is 20 requests per client IP per rolling 60 seconds; it resets with backend restart.
- **Port is already in use:** stop the process that owns the port or configure the dev server/application externally; no project-specific port override is defined.

## Safe Git workflow

Review the working tree before and after a change, especially because local document uploads and `.env` files are ignored runtime data:

```powershell
git status --short
git diff --check
git diff -- path\to\changed-file
```

Stage only files that belong to your change:

```powershell
git add README.md docs\API.md
git diff --cached --check
git status --short
```

Do not stage `.env` files, `backend/uploads/`, virtual environments, `node_modules/`, or build output. Inspect the staged diff before committing.
