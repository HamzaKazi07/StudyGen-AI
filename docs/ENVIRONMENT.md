# Environment Configuration

This inventory is based on environment reads in the current backend/frontend code. Real `.env` values must remain private and were not opened or copied into this document.

## Variables read by application code

| Variable | Used by | Required? | Example / default behavior |
| --- | --- | --- | --- |
| `GEMINI_API_KEY` | Backend AI service, `backend/services/ai_service.py` | Optional for application startup; required to make AI Tutor provider requests. | Keep a private provider key in backend configuration. If absent, general/document tutor returns a safe SSE configuration error. |
| `FRONTEND_URL` | Backend CORS and auth Origin allowlist | Optional | Defaults to `http://localhost:5173`. If set to one of the two local Vite URLs, both localhost and 127.0.0.1 origins are allowed; otherwise the configured origin is used. |
| `STUDYGEN_DATABASE_PATH` | Backend `database.py` | Optional | Defaults to `backend/data/studygen.sqlite3`. A relative override resolves from the backend process working directory. |
| `SESSION_COOKIE_SECURE` | Backend auth cookie configuration | Optional | Defaults to true when the `FRONTEND_URL` scheme is HTTPS, false otherwise. Set true for HTTPS deployments. Accepted values: `true`/`false` (also `1`/`0`, `yes`/`no`). Invalid values prevent application startup. |
| `SESSION_COOKIE_SAMESITE` | Backend auth cookie configuration | Optional | Defaults to `lax`. Set `none` only for cross-site frontend/API deployments and only with `SESSION_COOKIE_SECURE=true` over HTTPS. Invalid combinations prevent startup. |
| `VITE_API_URL` | Frontend shared API client, `frontend/src/lib/api.js` | Optional | In Vite development, defaults to `http://<current-frontend-hostname>:8000`; explicit HTTP loopback URLs are aligned to the frontend's `localhost`/`127.0.0.1` hostname. In production, defaults to the current origin. Set explicitly when the API is hosted elsewhere. This value is public browser configuration and must not include secrets. |

The backend calls `load_dotenv()` before route/service imports. Run Uvicorn from `backend/` so `.env` and any relative database path resolve as expected. Vite reads its environment when the dev server starts; restart it after changing frontend variables.

## Safe local examples

Create `backend/.env` locally:

```dotenv
GEMINI_API_KEY=replace-with-your-own-private-key
FRONTEND_URL=http://localhost:5173
STUDYGEN_DATABASE_PATH=./data/studygen.sqlite3
SESSION_COOKIE_SECURE=false
SESSION_COOKIE_SAMESITE=lax
```

Create `frontend/.env.local` locally:

```dotenv
VITE_API_URL=http://localhost:8000
```

In Vite development, the API URL defaults to the hostname used to open the frontend (for example, `localhost` or `127.0.0.1`). An explicitly configured HTTP loopback URL is also aligned to that hostname. This keeps the session cookie same-site with `SameSite=Lax`. For production, configure the API URL when it is not served from the frontend's origin.

Never put `GEMINI_API_KEY` in any `VITE_*` variable or frontend file. `docs/.env.example` contains these six names with placeholders/local values. Do not copy values from real `.env` files into documentation or support output.

## Settings that are not environment variables

| Setting | Current value | Effect |
| --- | --- | --- |
| Session lifetime | 12 hours | Server-side expiry; expired sessions are rejected and removed on access. |
| Password length | 12–128 characters at registration | Pydantic request validation. |
| Authentication-attempt limit | 10 registration/login attempts per client IP per 60 seconds | In-memory, per process. |
| Document upload size | 20 MiB | Backend chunked read limit; frontend also checks size. |
| Tutor question length | 4,000 characters maximum | Pydantic request field. |
| Tutor history passed to provider | Latest 20 messages | Tutor route/service behavior; per-message and aggregate sizes are not separately bounded. |
| Tutor request rate | 20 requests per client IP per 60 seconds | In-memory, per process. |
| Document context | 12,000 characters | AI service. |
| AI output | 1,500 output tokens | Gemini generation configuration. |

These values have no environment reads and should not be treated as configurable.
