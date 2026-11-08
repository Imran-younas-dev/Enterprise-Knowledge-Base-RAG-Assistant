# 30-day implementation journal

This file is a **reader's guide** to what was built during the Enterprise Knowledge Base RAG Assistant plan (`docs/30-day-plan.md`). Each day lists the suggested git branch, the problem it solved, and what you can point to in the repo.

For HTTP routes and processes, see `docs/architecture.md`. For how to run the end-to-end demo, see **Demo** in `README.md`.

---

## Days 1–6 — Foundation

| Day | Branch | Purpose | What shipped |
|-----|--------|---------|--------------|
| **1** | `day-01-run-the-starter` | Prove the monorepo runs | API health route, web dashboard shell, CSS aligned to `UI.jpeg` |
| **2** | `day-02-api-rules` | Own NestJS conventions | Lint/format, `translate('messages', 'healthOk')`, trace health → controller → service |
| **3** | `day-03-mysql-and-redis` | Local data stack | Docker Compose (MySQL 9 + Redis), Sequelize config, `db:check` script |
| **4** | `day-04-users-and-documents` | Persistent domain | Migrations `users`, `documents`, models, dev user seeder |
| **5** | `day-05-register-and-login` | Identity | Register/login DTOs, bcrypt, JWT (`CLIENT_SECRET`), auth controller |
| **6** | `day-06-auth-guard-and-name` | Protected UI | `AuthGuard`, scope guard, sign-in page, token in browser storage |

**Why it matters:** Everything after Day 6 assumes signed-in users, JWT scopes, and MySQL rows—not mock data.

---

## Days 7–14 — Documents, retrieval, and dashboard

| Day | Branch | Purpose | What shipped |
|-----|--------|---------|--------------|
| **7** | `day-07-list-documents` | Real source list | `GET /api/documents`, owner-scoped list, `SourceDocuments` from API |
| **8** | `day-08-upload-file` | Ingestion entry | Multipart upload, mime/size checks, `queued` status, Documents page upload |
| **9** | `day-09-read-document-text` | Parse pipeline start | `parse-document.js` (TXT/MD first), safe errors for empty/unsupported |
| **10** | `day-10-document-chunks` | Chunk storage | `document_chunks` table, `chunk-text.js` (500 / 50 overlap), chunk script |
| **11** | `day-11-embeddings` | Vectors | Local Xenova embeddings, `embed-texts.js`, embedding column (VECTOR on MySQL 9, JSON on 8) |
| **12** | `day-12-retrieve-passages` | Search | `SearchService`, `POST /api/retrieval/search`, modes (web/deep/thinking), chunk panel from API |
| **13** | `day-13-grounded-answer` | RAG answer | `complete-answer.js`, `AskService`, citation filtering, latency metadata |
| **14** | `day-14-connect-dashboard` | UI ↔ API | Search submits to ask, references, thinking layout, removed mock document rows from UI path |

**Why it matters:** Day 14 is the first time the dashboard matches the product story: upload → chunk → ask → cite.

---

## Days 15–20 — Queue, formats, and deduplication

| Day | Branch | Purpose | What shipped |
|-----|--------|---------|--------------|
| **15** | `day-15-ingestion-queue` | Async ingest | Bull queue `ingestDocument`, processor, `queue-dev` worker |
| **16** | `day-16-document-status` | Visible progress | `processing` / `failed`, row status in UI, poll until `ready` |
| **17** | `day-17-idempotent-retries` | Safe retries | Transactional `replaceChunks`, transient error retries |
| **18** | `day-18-reprocess-and-delete` | Lifecycle | Reprocess, soft delete, search excludes deleted docs, UI actions |
| **19** | `day-19-pdf-pages` | PDF + pages | `pdf-parse`, page numbers on chunks, sample `harbor-audit.pdf` |
| **20** | `day-20-docx-and-hash` | DOCX + duplicates | `mammoth`, section titles, SHA-256 duplicate upload message |

**Why it matters:** Uploads stay fast because HTTP only enqueues; the worker owns parse/chunk/embed cost.

---

## Days 21–25 — Trust, evaluation, security

| Day | Branch | Purpose | What shipped |
|-----|--------|---------|--------------|
| **21** | `day-21-trusted-citations` | Honest citations | Quotes from chunk text, strip invented citation IDs, `npm test` |
| **22** | `day-22-evaluation-set` | Measure retrieval | `evals/questions.jsonl`, `evaluate-retrieval.js`, `docs/evaluation.md` |
| **23** | `day-23-answer-review` | Human answer QA | `review-answers.js`, stem overlap fix (`failed`/`fails`), insufficient UI copy |
| **24** | `day-24-user-isolation` | Authorization | Owner filters in SQL, 404 for cross-user docs, `user-isolation.test.js` |
| **25** | `day-25-prompt-injection` | Untrusted chunks | Injection fixture, hardened prompt, `chunk-quote.js`, security notes in evaluation |

**Why it matters:** Retrieval and answer quality are measured separately; security treats chunk text as data, not instructions.

---

## Days 26–30 — Production polish and stop

| Day | Branch | Purpose | What shipped |
|-----|--------|---------|--------------|
| **26** | `day-26-request-limits` | Abuse/cost guards | File/question/chunk caps, throttling on ask/upload, inline validation errors |
| **27** | `day-27-empty-and-error-states` | UX completeness | Empty/loading/failed states in same panels, API-down banners, ask loading |
| **28** | `day-28-logs-and-health` | Operability | `X-Request-Id`, access logs, health checks (API/DB/Redis), Settings health list |
| **29** | `day-29-demo-path` | Onboarding | README **Demo** walkthrough, `architecture.md` routes, removed `sampleKnowledge.ts` |
| **30** | `day-30-measure-and-stop` | Close with data | Rerun metrics, README **Known limits**, Day 30 note in `evaluation.md`, this journal |

---

## What we deliberately kept simple (Day 30 “explain one decision”)

**Decision:** Keep the default **local grounded reader** (`CHAT_PROVIDER=local`, `CHAT_MODEL=local-grounded-reader`) instead of wiring OpenAI/Anthropic in the API.

**Measurement that justifies it:** On the evaluation set (12 questions, 10 answerable), **Hit Rate@4 = 1.000 (10/10)** and automated answer review **faithful 10/10** with the local reader. Latency on warm runs is dominated by retrieval (~17–21 ms in review scripts; first embedding load can be ~550 ms on cold start)—not an external LLM round trip.

A hosted chat model would add cost, secrets, and compliance review before it improves *measured* faithfulness on this small corpus. The architecture hook (`complete-answer.js`) is where a real provider would plug in later.

---

## Does it work “live” today?

| Environment | Status |
|-------------|--------|
| **Local demo** (Docker + API + queue worker + web) | **Yes** — follow README **Demo** if `.env` has a real `CLOUDINARY_URL` |
| **Public internet / production** | **Not turnkey** — you still need hosting, HTTPS, secrets, a always-on worker, and backups |

### Models: do you need to “connect” an external modal/API?

**Embeddings (required for search):** Default is **local** — `EMBEDDING_PROVIDER=local`, `EMBEDDING_MODEL=Xenova/all-MiniLM-L6-v2` (384 dimensions). First run downloads the model; no API key. You *can* change env vars later if you add another provider in `embed-texts.js`.

**Chat (answers):** Default is **local** — not ChatGPT/Claude. The “model” is rule-based overlap over retrieved passages in `complete-answer.js`. Setting `CHAT_PROVIDER` to anything other than `local` currently throws `answer-provider-failed` until you implement a real provider.

**Summary:** You do **not** need an external LLM API for the 30-day demo and tests. You **do** need **Cloudinary** for file storage and **MySQL + Redis** for data and the ingest queue.

---

## What we skipped, stubbed, or used only for testing

| Topic | What we did | Why |
|-------|-------------|-----|
| **Organizations / teams** | Single-owner documents only | Plan scope; authorization is `owner_id` in SQL |
| **Reranker** | Cosine ranking only, top-k 4/8 | Simpler pipeline; Hit Rate@4 already 1.0 on eval set (n=10) |
| **External LLM** | Local reader only | Measured faithfulness sufficient on eval set; avoids unmeasured latency/cost claims |
| **Vector DB (Pinecone, etc.)** | MySQL stores embeddings | Plan uses MySQL 9 `VECTOR`; MySQL 8 uses JSON + in-app similarity |
| **Cron jobs** | `cron-dev` boots, minimal work | Ingestion is queue-driven, not scheduled |
| **Ingestion HTTP module** | Empty `IngestionController` | Jobs triggered from documents service + worker |
| **Sample UI data** | Removed `sampleKnowledge.ts` | Dashboard reads API only |
| **Dev seed user** | `imran@localhost` / `development-password` | Local/testing only — rotate for any shared environment |
| **Evaluation corpus** | 12 questions, 3 files in `evals/` + samples | Small, intentional; not a production benchmark |
| **JWT in localStorage** | Demo sign-in persistence | Fine for local demo; production should consider httpOnly cookies |

---

## Blockers we hit during the build (for your awareness)

- **Cloudinary** — uploads fail without a valid `CLOUDINARY_URL` (not a bug; storage is external by design).
- **Queue worker** — forgetting `npm run queue-dev` leaves documents stuck in `queued`.
- **MySQL in CI/sandbox** — some tests (`user-isolation`) need a live DB; unit tests run without it.
- **CORS** — Vite may use port **5174**; API allows 5173 and 5174.
- **Cold start** — first embedding inference can take hundreds of ms; not representative of steady-state latency.

---

## Where to read next

| Doc | Contents |
|-----|----------|
| `README.md` | Demo, limits, measured numbers |
| `docs/evaluation.md` | Hit rate, faithfulness, security, Day 30 closing note |
| `docs/architecture.md` | Routes, flows, processes |
| `docs/30-day-plan.md` | Original daily schedule |
