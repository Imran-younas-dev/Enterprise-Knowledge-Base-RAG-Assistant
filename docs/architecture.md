# Architecture

Internal knowledge assistant: an authenticated employee uploads approved documents and asks questions. Answers are grounded in retrieved passages and include citations. If the index does not contain enough evidence, the system says so.

## Stack

| Layer | Technology |
|---|---|
| UI | React + TypeScript (Vite), `apps/web` |
| API | NestJS JavaScript (Babel), `apps/api` |
| Database | MySQL 9 (Compose) with chunk embeddings stored for similarity search |
| Queue | Redis + Bull (`ingestDocument` worker in `queue.index.js`) |
| Files | Cloudinary (`CLOUDINARY_URL`) for originals |
| Embeddings | Local Xenova model by default (`EMBEDDING_PROVIDER=local`) |
| Answers | Local grounded reader by default (`CHAT_PROVIDER=local`) |

Daily build order: `docs/30-day-plan.md`. API conventions: `apps/api/NESTJS-STRUCTURE.md`.

## Processes

| Process | Command | Role |
|---|---|---|
| HTTP API | `apps/api` → `npm run dev` | REST under `/api` |
| Queue worker | `apps/api` → `npm run queue-dev` | Parse, chunk, embed, index uploads |
| Cron | `apps/api` → `npm run cron-dev` | Scheduled enqueue only (optional for demo) |
| Web | `apps/web` → `npm run dev` | Dashboard, Documents, Settings |

Uploads return quickly with status `queued`; the worker moves documents to `ready` or `failed`.

## Flows

**Ingestion:** sign in → `POST /api/documents` (multipart file) → validate size/type → store in Cloudinary → insert `documents` row → enqueue `ingestDocument` → worker parses (PDF/DOCX/TXT/MD) → chunk with page/section metadata → embed → store vectors → `ready`.

**Question:** `POST /api/chat/ask` with `{ question, mode }` → embed question → retrieval scoped to the signed-in owner → grounded answer with citations tied to retrieved chunk ids → insufficient-evidence response when passages do not support an answer.

**Search-only:** `POST /api/retrieval/search` returns retrieved chunks (used internally; same auth and modes as ask).

Authorization is enforced in document and retrieval services (owner-scoped rows). Cross-owner document ids return `404`.

## HTTP routes (shipped)

All successful JSON responses use `{ "data": ... }`. Errors use `{ "message": "...", "key?": "...", "errors?": [...] }`.

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `GET` | `/api/health` | Public | API, database, and Redis checks |
| `POST` | `/api/auth/register` | Public | Create account |
| `POST` | `/api/auth/login` | Public | JWT session |
| `GET` | `/api/auth/me` | Bearer | Current user |
| `GET` | `/api/documents` | Bearer | List own documents |
| `POST` | `/api/documents` | Bearer | Upload file (field name `file`) |
| `GET` | `/api/documents/:id` | Bearer | Document detail |
| `GET` | `/api/documents/:id/chunks` | Bearer | Chunks for a document |
| `POST` | `/api/documents/:id/reprocess` | Bearer | Re-enqueue ingestion |
| `DELETE` | `/api/documents/:id` | Bearer | Soft-delete and remove file |
| `POST` | `/api/retrieval/search` | Bearer | Vector search (`question`, `mode`) |
| `POST` | `/api/chat/ask` | Bearer | Answer + citations + chunks |

The `ingestion` module registers no HTTP routes; ingestion is triggered from document create/reprocess and the Bull worker.

`POST /api/chat/ask` and `POST /api/documents` return an `X-Request-Id` header and write a one-line access log (method, path, status, duration—no bodies or chunk text).

## Data

- `users` — email, password hash
- `documents` — owner, filenames, Cloudinary key, content hash, status (`queued`, `processing`, `ready`, `failed`, `deleting`, `deleted`), error summary
- `document_chunks` — text, embedding storage, page/section metadata, document id

Migrations live under `apps/api/migrations/`. Do not use Sequelize `sync()` in application code.

## UI map (`apps/web/UI.jpeg`)

- **Search** — question + Web / Thinking / Deep Search modes
- **Source Documents** — list from API; upload on Documents page
- **Document Chunks** — passages for selection or post-ask retrieval
- **AI-Generated Answer** + **References** — grounded answer with clickable citations

Extended product notes: `enterprise-rag-assistant-architecture.md` at the repository root.
