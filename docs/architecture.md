# Architecture

Internal knowledge assistant: an authenticated employee uploads approved documents and asks questions. Answers are grounded in retrieved passages and include citations. If the index does not contain enough evidence, the system says so.

## Stack

React + TypeScript, NestJS (JavaScript, see `apps/api/NESTJS-STRUCTURE.md`), MySQL 9, Redis + BullMQ, an LLM and embedding API. The day-by-day schedule is `docs/30-day-plan.md`.

## Components

| Component | Responsibility |
|---|---|
| React UI (`apps/web`) | Upload documents, show status, ask questions, show answers and citations |
| NestJS API (`apps/api`) | Validate requests, enforce permissions, coordinate services |
| MySQL 9 | Users, documents, chunks, embeddings, and similarity search |
| Redis + BullMQ | Queue long-running ingestion so uploads return quickly |
| Ingestion worker (`workers`) | Parse, chunk, embed, and index a document |
| File storage | Keep the original file in Cloudinary for reprocessing. The storage key is generated and is not the original filename. |
| Embedding model | Vectors for chunks and questions in the same space |
| LLM | Compose an answer from retrieved evidence only |

The application retrieves authorized evidence first, then sends that evidence to the LLM. The model is not the source of truth.

## Flows

**Ingestion:** sign in → upload → validate → store file and a `queued` document → enqueue a job → parse → chunk with source metadata → embed → store the vector in MySQL → mark `ready` only after indexing succeeds.

**Question:** authenticate → embed the question → search only authorized chunks → check evidence → generate an answer with citations that refer to retrieved chunks → return the answer. Authorization is enforced in retrieval, not only in the prompt.

## API modules (starter)

| Module | Later responsibility |
|---|---|
| `auth` | Authentication and document-level authorization |
| `documents` | Upload, list, status, reprocess, delete |
| `ingestion` | Job enqueue and document lifecycle status |
| `retrieval` | Authorized similarity search and evidence checks |
| `chat` | Question endpoint, citation validation, response shape |

`GET /api/health` is the only implemented route. It returns `{ "status": "ok" }`.

## Data (planned)

- `users` — identity
- `documents` — file metadata, storage key, content hash, status
- `document_chunks` — text, a MySQL `VECTOR` column, page/section, document and version

Embeddings use MySQL 9’s `VECTOR` type. Retrieval orders authorized chunks with `DISTANCE(..., 'COSINE')`. That is an exact scan over the chunks the user may see, which is the right fit for this project. MySQL 8 does not have this type, so the Compose file uses `mysql:9`.

Full product notes remain in `enterprise-rag-assistant-architecture.md` at the repository root.
