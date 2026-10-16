# Implementation plan

The day-by-day schedule is `docs/30-day-plan.md`. This file is the phase outline behind that schedule.

Build one working slice at a time. Do not claim performance until it is measured.

## Phase 0 — Setup

- This starter: repository layout, README, API, web app, Docker Compose for MySQL 9 and Redis.
- Next: choose one LLM provider and one embedding model, and record their names.

**Done when** a new developer can start the API and web app from the README.

## Phase 1 — Minimum RAG slice

- Upload one or two file types.
- Parse, chunk, embed, and store chunks.
- Embed the question, retrieve by similarity, and return an answer with source metadata.
- Minimal UI: upload a file and ask a question.

**Done when** one question can be traced from UI → API → embedding → retrieval → LLM → cited answer.

## Phase 2 — Grounding and evaluation

- Page/section metadata, citations tied to retrieved chunk IDs, and an insufficient-evidence response.
- A versioned evaluation set and a retrieval baseline (Hit Rate@k or Recall@k).

## Phase 3 — Ingestion jobs

- Move ingestion into Redis + BullMQ under `workers`.
- Statuses, retries, idempotent reprocessing, and deletion that removes chunks.

## Phase 4 — Auth and security

- Authentication and document permissions applied to list, status, retrieval, reprocess, and delete.
- Limits on file size and question length. Treat retrieved text as untrusted.

## Phase 5 — Retrieval quality

- Measure a vector baseline, then compare keyword or hybrid retrieval on the same evaluation set.
- Add a reranker only if the baseline shows a problem it can fix.

## Phase 6 — Deployment

- Deploy UI, API, worker, MySQL 9, Redis, and file storage.
- Health checks, migrations, and a demo of upload, a cited answer, an unanswerable question, and deletion.
