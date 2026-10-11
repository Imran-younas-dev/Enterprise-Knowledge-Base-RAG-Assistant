# 30-day plan

Use this file as the only schedule. The visual target is `apps/web/UI.jpeg`. The API coding rules are `apps/api/NESTJS-STRUCTURE.md`. Product scope stays in `docs/architecture.md`.

Work about **4 hours a day**. Each day below is split into three blocks. Finish the "Done when" line before you start the next day. If you only have two hours, do block 1 and block 2, and finish block 3 the next morning before any new day.

The dashboard already shows the layout from the mock with **sample data**. Later days replace that sample with the API. Do not redesign the screen.

## Before Day 1

Do this before you write product code. Budget two or three evenings. You are not behind if Day 1 starts after this.

### JavaScript you will type every day

- `import` / `export`, arrow functions, `async` / `await`, destructuring (`const { body, user } = request`)
- Classes, `this`, and default exports
- Array methods: `map`, `filter`, `find`
- Why this API is JavaScript compiled by Babel, not TypeScript

### NestJS words in `apps/api/NESTJS-STRUCTURE.md`

Read that file once, slowly. You should be able to point at an example and say what it does:

- A **module** groups a controller and its services
- A **controller** is the HTTP route. It calls `response.json({ data })`
- A **service** is one action (`get`, `create`, `remove`). The controller does `new GetService()`, not Nest injection
- A **DTO** is a `class-validator` class checked by `ValidateRequestGuard`
- A **guard** checks the token or the scope. It does not decide which rows the user may see
- Three processes: HTTP (`index.js`), cron (`cron.index.js`), queue worker (`queue.index.js`)

### React

- A component returns JSX
- `useState` holds what the screen shows
- `useEffect` runs after render (you will use it for the health check and, later, loading documents)
- Props are inputs to a component

### HTTP

- `GET` reads, `POST` creates, `DELETE` removes
- Status codes you will use: `200`, `201`, `202`, `400`, `401`, `403`, `404`, `422`
- JSON body, and `Authorization: Bearer <token>`
- This API wraps success payloads as `{ "data": ... }`

### SQL, in one sitting

- A table, a primary key, a foreign key
- `INSERT`, `SELECT`, `UPDATE`, `DELETE`
- A migration is the file that creates or changes a table. The app must not call `sync()`

### RAG, before any embedding code

Say these out loud in your own words:

- The model does not search the database. The app retrieves passages, then gives those passages to the model
- A **chunk** is a piece of a document with a page or section attached
- An **embedding** is a list of numbers for that text. The question and the chunks must use the same embedding model
- A **citation** must point at a chunk that was actually retrieved
- If the chunks do not support an answer, the app says the evidence is insufficient
- Text inside a document is untrusted. It cannot change permissions or system instructions

### Tools

- `git status`, `git diff`, `git commit`
- What `docker compose up -d` starts: PostgreSQL with pgvector, and Redis
- Copy `.env.example` to `.env`. Never commit `.env`

### Check you are ready

You can explain the six API folders under `apps/api/src/modules/` (`health`, `auth`, `documents`, `ingestion`, `retrieval`, `chat`) and the four panels on the mock: search, source documents, chunks, answer plus references.

## Rules for all 30 days

- API files are `.js`. No new `.ts` files under `apps/api`.
- One action per service file. List, create, and delete do not share a service.
- Register a new module in `src/modules/index.js` only. Do not import feature modules inside `app.module.js`.
- User-facing errors go through `translate()` and `AppValidationError`.
- The web layout stays the one in `apps/web/UI.jpeg`: mint background, **AI SEARCH** header, Dashboard / Documents / Settings, search field, Web Search / Thinking / Deep Search, source documents, chunks, answer, references.
- Button meanings, so the labels on the mock stay:
  - **Web Search** — search the internal document index
  - **Thinking** — show the retrieved chunks before the answer
  - **Deep Search** — retrieve more chunks (higher top-k)
- Sample rows in `apps/web/src/data/sampleKnowledge.ts` are placeholders. Delete them when the dashboard reads the API.

## Day 1 — Run what is already here

**Block 1 (70 min).** Read `README.md`, `docs/architecture.md`, and `apps/api/NESTJS-STRUCTURE.md`. Draw the mock on paper and name each panel.

**Block 2 (80 min).** From `apps/api`: `npm install`, then `npm run dev`. Open `http://localhost:3000/api/health` and confirm `{ "data": { "status": "ok" } }`. Start `npm run cron-dev` and `npm run queue-dev` in two other terminals and confirm each process stays up.

**Block 3 (90 min).** From `apps/web`: `npm install`, then `npm run dev`. Open `http://localhost:5173`. Click Dashboard, Documents, and Settings. Compare the dashboard with `apps/web/UI.jpeg` and write a short list of visual gaps (spacing, colors, type). Fix only those gaps in `apps/web/src/index.css`.

**Done when:** both apps run, and your gap list is either empty or fixed.

**You can explain:** why health returns `{ data }` and which file builds that response (`check.service.js`).

## Day 2 — Make the API rules yours

**Block 1 (60 min).** Trace a request: `index.js` → `src/main.js` → `src/app.module.js` → `src/modules/index.js` → `health.controller.js` → `check.service.js`.

**Block 2 (90 min).** Run `npm run lintfix` and `npm run format` in `apps/api`. Read `.babelrc`, `.prettierrc`, and `.eslintrc.js` until you know why there are no semicolons and why decorators work.

**Block 3 (90 min).** Add `src/lang/en/messages.js` key `healthOk` and return `translate('messages', 'healthOk')` as the health status. Restart the API and refresh Settings, which already calls `/api/health`.

**Done when:** Settings shows the translated health string, and lint is clean.

**You can explain:** the difference between the HTTP process, the cron process, and the queue process.

## Day 3 — Database and Redis on your machine

**Block 1 (50 min).** Copy `.env.example` to `.env`. Run `docker compose up -d`. Confirm Postgres and Redis accept connections.

**Block 2 (100 min).** Add `sequelize`, `sequelize-typescript`, `pg`, and `sequelize-cli`. Point `src/models/AbstractModel.js` at `sequelize-typescript`'s `Model`. Build a Sequelize instance in `src/models/index.js` from `src/config/database.js`. Add `npm run migrate` using `.sequelizerc`.

**Block 3 (90 min).** Call `sequelize.authenticate()` from a script in `src/scripts/` (run with `babel-node`). Do not connect by importing models from a controller yet.

**Done when:** the script prints that Postgres answered, and the HTTP API still boots if you do not run the script.

**You can explain:** why `src/config/database.js` stays CommonJS.

## Day 4 — Users and documents tables

**Block 1 (80 min).** Migration `users`: id UUID, email unique, password hash, timestamps.

**Block 2 (80 min).** Migration `documents`: id, owner id, title, original filename, mime type, byte size, storage key, content hash, status, error summary, timestamps. Status values: `queued`, `processing`, `ready`, `failed`, `deleting`, `deleted`.

**Block 3 (80 min).** Models `src/models/User.js` and `src/models/Document.js`, registered in `src/models/index.js`. One seeder that inserts your user only in development.

**Done when:** `npm run migrate` and `npm run seed` succeed, and `npm run undo` drops what you added.

**You can explain:** why the document row and the file bytes are different things.

## Day 5 — Register and login

**Block 1 (70 min).** `src/modules/auth/dto/register.dto.js` and `login.dto.js` with `class-validator`.

**Block 2 (100 min).** `register.service.js` and `login.service.js`. Hash passwords with `bcrypt`. Login returns a JWT signed with `CLIENT_SECRET`. Add `@nestjs/jwt`.

**Block 3 (70 min).** Wire `auth.controller.js` using the controller rules in `NESTJS-STRUCTURE.md`: `@ValidateRequest`, guards, `response.json({ data })`. Login can stay public. Add `src/guards/validate-request.guard.js` and `src/decorators/validate-request.decorators.js`.

**Done when:** you can register and log in with curl or an HTTP client and receive a token.

**You can explain:** why the password hash never goes back in the JSON response.

## Day 6 — Guard the routes and show your name

**Block 1 (90 min).** `src/guards/jwt-auth.guard.js` reads `Authorization: Bearer`, verifies the JWT, and sets `request.user`.

**Block 2 (70 min).** `src/decorators/check-scope.decorator.js` and `src/guards/check-scope.guard.js`. Give the seeded user a scope such as `member` on the token.

**Block 3 (80 min).** Add a tiny sign-in form that uses the same frame as the app (same header, mint background). On success, store the token in memory, then open the dashboard. Replace the header label "Avatar Name" with the user's name or email.

**Done when:** refreshing the page asks you to sign in again (memory storage is enough this month), and a request without a token is `401`.

**You can explain:** guards check identity. Services decide which rows that identity may see.

## Day 7 — List documents into the left panel

**Block 1 (80 min).** `src/modules/documents/get.service.js` returns documents owned by `request.user`. `view.service.js` returns one document or throws `AppValidationError` with `404`.

**Block 2 (70 min).** `GET /api/documents` and `GET /api/documents/:id` on `documents.controller.js`. Static paths stay above `:id` if you add them.

**Block 3 (90 min).** `apps/web/src/lib/api.ts` loads the list with the bearer token. `SourceDocuments` renders that list instead of `sampleKnowledge` on the dashboard and on the Documents page. Keep the row layout from the mock (icon, title, date).

**Done when:** an empty database shows an empty list, and a seeded document shows up in the panel.

**You can explain:** the JSON shape the panel expects.

## Day 8 — Upload a file

**Block 1 (80 min).** `create.service.js` checks mime type and size using `src/config/uploads.js`. Allowed: PDF, DOCX, TXT, Markdown. Store the file under a generated storage key, never the raw filename.

**Block 2 (80 min).** Insert a document row with status `queued`. `POST /api/documents` returns `202` and `{ data: { id, status } }`.

**Block 3 (80 min).** Enable the Documents page "Choose file" button. After upload, the new row appears in Source Documents. Do not parse the file today.

**Done when:** a `.txt` file lands on disk and a `queued` row is visible.

**You can explain:** why the original filename is not the path on disk.

## Day 9 — Read text out of a file

**Block 1 (90 min).** A helper `src/helpers/parse-document.js` that returns text for `.txt` and `.md`. PDF and DOCX can return a clear "not supported yet" error.

**Block 2 (70 min).** `src/scripts/print-document.js` prints the text and a placeholder page number.

**Block 3 (80 min).** Add strings in `src/lang/en/errors.js` for unsupported type and empty text. Throw `AppValidationError` when the file has no text.

**Done when:** the script prints a sample note you wrote, and an empty file fails with your error key.

**You can explain:** what you will keep (headings, page breaks) and what you will not clean away.

## Day 10 — Chunks on the screen

**Block 1 (90 min).** Migration `document_chunks`: id, document id, chunk index, content, page number, section title, metadata JSON, timestamps. Unique on `(document_id, chunk_index)`.

**Block 2 (90 min).** `src/helpers/chunk-text.js` splits text with a size and overlap you choose and write down in this file (start around 500 characters and 50 overlap; change it only when you have a reason). Every chunk keeps document id and index.

**Block 3 (60 min).** A script writes chunks for one local file. The Document Chunks panel still uses sample data today. Tomorrow it can read these rows.

**Done when:** you can open the chunk rows in Postgres and see the source text you expect.

**You can explain:** what goes wrong if chunks are tiny, and what goes wrong if a chunk is larger than the model context.

## Day 11 — Embeddings

**Block 1 (60 min).** Pick one embedding model. Write the provider name, model name, and vector size at the top of `.env.example` as placeholders (no secret in git).

**Block 2 (100 min).** `src/helpers/embed-texts.js` sends batches and returns vectors. Add a `vector(<size>)` column via a migration. You need the `pgvector` extension in a migration (`CREATE EXTENSION IF NOT EXISTS vector`).

**Block 3 (80 min).** Store embeddings for the script's chunks. If the provider fails, leave the document `failed` with a safe error summary, not the raw provider body.

**Done when:** one chunk row has a vector, and the dimension matches the model.

**You can explain:** why changing the embedding model means embedding the chunks again.

## Day 12 — Retrieve passages

**Block 1 (80 min).** `src/modules/retrieval/search.service.js` embeds the question and runs a similarity query limited to the caller's documents. Start with a configurable top-k (default 4).

**Block 2 (70 min).** `POST /api/retrieval/search` with a DTO (`question` required, `mode` optional). Map modes: `web` top-k 4, `deep` top-k 8, `thinking` same as web but the response includes a flag the UI can use.

**Block 3 (90 min).** Clicking a source document on the dashboard calls the API only if you have a question; otherwise it filters chunks you load with `GET /api/documents/:id/chunks` (add `chunks.service.js` under documents). Replace the sample chunk list.

**Done when:** a question you know the answer to returns the chunk you wrote on Day 10.

**You can explain:** where the owner filter sits in the SQL, not only in the prompt.

## Day 13 — One grounded answer

**Block 1 (70 min).** Pick the chat model. Add `src/helpers/complete-answer.js`. The prompt says: answer only from the passages, cite passage ids, and say when evidence is insufficient.

**Block 2 (100 min).** `src/modules/chat/ask.service.js` calls retrieval, then the model, then drops any citation id that was not in the retrieved set. `POST /api/chat/ask` returns `{ data: { answer, insufficientEvidence, citations } }`.

**Block 3 (70 min).** Log latency for retrieval and for the model on the response metadata. Do not log the document text.

**Done when:** a curl question returns an answer whose citation ids exist on the retrieved chunks, and a nonsense question returns `insufficientEvidence: true`.

**You can explain:** why a citation the model invents is removed.

## Day 14 — Connect the dashboard

**Block 1 (90 min).** The search field submits to `POST /api/chat/ask`. The answer panel shows the returned text. Citation numbers match the mock style (`1`, `2`).

**Block 2 (80 min).** The References list is built from `citations` (title, page, quote). Clicking a number highlights that chunk card.

**Block 3 (70 min).** Thinking mode shows the chunk panel before the answer text. Deep Search sends `mode: "deep"`. Web Search stays the default. Remove `sampleKnowledge` from the dashboard path.

**Done when:** you can ask a question in the UI and see a cited answer from your own file, on the same layout as `UI.jpeg`.

**You can explain:** the path UI → chat service → retrieval → model → citation check → panels.

## Day 15 — Ingestion leaves the request

**Block 1 (80 min).** Add `bull` and `@nestjs/bull`. `src/config/bull.js` is the connection. Queue name `ingestDocument` (camelCase, same string in producer and processor).

**Block 2 (90 min).** `src/queues/ingest-document.processor.js` loads the file, parses, chunks, embeds, and sets status `ready` only after the vectors are stored. Register it on `QueueModule`.

**Block 3 (70 min).** `create.service.js` enqueues the job and returns immediately. Run `npm run queue-dev` while the API runs.

**Done when:** upload returns in well under a second and the row becomes `ready` after the worker finishes.

**You can explain:** why the HTTP process must not wait for embeddings.

## Day 16 — Status on the document row

**Block 1 (70 min).** While the job runs, status is `processing`. On failure, status is `failed` plus `error_code` and a short safe summary.

**Block 2 (80 min).** The source-document row shows the status next to the date without breaking the mock layout (small muted text is enough).

**Block 3 (90 min).** Poll `GET /api/documents/:id` from the Documents page until the status is `ready` or `failed`.

**Done when:** you can watch a file move from queued to ready, and a broken file stays failed with a readable reason.

**You can explain:** which statuses exist and which one means "safe to search".

## Day 17 — Retries without duplicate chunks

**Block 1 (80 min).** Configure a small retry count on the ingest job for transient provider errors.

**Block 2 (90 min).** At the start of a job, delete chunks for that document and version, then insert the new set in one transaction. A retry must not leave two copies of chunk 0.

**Block 3 (70 min).** Stop the provider (bad API key) and confirm the job retries, then lands on `failed` instead of `ready`.

**Done when:** running the same job twice leaves one chunk set.

**You can explain:** what "idempotent ingestion" means on this project.

## Day 18 — Replace, reprocess, delete

**Block 1 (80 min).** `POST /api/documents/:id/reprocess` enqueues the same job for an authorized owner.

**Block 2 (80 min).** `remove.service.js` sets `deleting`, removes chunks, removes the stored file, then sets `deleted`. `DELETE /api/documents/:id`.

**Block 3 (80 min).** Documents page: Reprocess and Delete on the selected row. After delete, the row disappears from Source Documents and from search.

**Done when:** a deleted file cannot be retrieved by an old question.

**You can explain:** why search must exclude `deleted` rows even if a chunk delete failed halfway (and how your transaction avoids that).

## Day 19 — PDF text and page numbers

**Block 1 (120 min).** Extend `parse-document.js` for PDF. Keep a page number when the parser exposes one.

**Block 2 (60 min).** Store `page_number` on each chunk. The chunk card already has a "Source" line. Fill it from the API (`p. 5` style from the mock).

**Block 3 (60 min).** Upload a real multi-page PDF from the Documents page and confirm pages show on the chunk cards.

**Done when:** at least one PDF shows page numbers on the chunks you retrieve.

**You can explain:** what you do when a parser has no page number (leave it null, do not invent one).

## Day 20 — DOCX and content hash

**Block 1 (90 min).** Parse DOCX into text plus heading text as `section_title` when you can.

**Block 2 (70 min).** Compute a content hash on upload. If the same owner uploads the same bytes, return the existing document instead of a second copy.

**Block 3 (80 min).** Show that case in the Documents page with a short message from `src/lang/en/messages.js`.

**Done when:** uploading the same file twice does not create two searchable copies.

**You can explain:** hash versus filename.

## Day 21 — Citations you can trust

**Block 1 (80 min).** Each reference row uses the document title, page or section, and a short quote taken from the stored chunk, not from the model's memory.

**Block 2 (80 min).** Add an automated test (Node test runner is enough) that feeds a fake model citation with an unknown id and asserts it is removed.

**Block 3 (80 min).** Add a second test for the insufficient-evidence path. The answer panel shows a clear sentence, and References stays empty.

**Done when:** both tests pass with `npm test` (add that script).

**You can explain:** the difference between a fluent answer and a grounded answer.

## Day 22 — A small evaluation set

**Block 1 (70 min).** Create `evals/questions.jsonl` with at least 10 questions: some answerable from your files, some paraphrased, at least 2 with no answer in the corpus.

**Block 2 (100 min).** `src/scripts/evaluate-retrieval.js` prints Hit Rate@k (did the expected document show up in the top k).

**Block 3 (70 min).** Run it, write the number and the date in `docs/evaluation.md`, and do not change chunk size on the same day. One change at a time.

**Done when:** you can rerun the script and get a comparable number.

**You can explain:** why you measure retrieval separately from answer quality.

## Day 23 — Answer review

**Block 1 (90 min).** Read 10 answers yourself. For each, mark faithful / not faithful and whether every citation matches the quote.

**Block 2 (70 min).** Record the counts in `docs/evaluation.md`. Fix one prompt or retrieval bug if you found a repeated failure. Rerun retrieval evaluation if you changed retrieval.

**Block 3 (80 min).** Add the insufficient-evidence sentence to the answer panel so it still matches the mock's typography (same panel, different text).

**Done when:** the evaluation note has both a retrieval number and a short human review.

**You can explain:** one question the system missed, and why.

## Day 24 — A second user cannot see your files

**Block 1 (80 min).** Register a second user. Confirm `GET /api/documents` for that user does not list your files.

**Block 2 (80 min).** Confirm retrieval and `GET /api/documents/:id` return `404` or `403` for the other user's id. Prefer not leaking whether the id exists if you already chose one behavior; write it down.

**Block 3 (80 min).** Add a test that logs in as user B and asserts user A's chunk text is absent.

**Done when:** the test fails if you remove the owner filter from the SQL.

**You can explain:** why a filter only in the prompt is not authorization.

## Day 25 — Prompt injection in a fixture

**Block 1 (80 min).** Add a text fixture whose body says to ignore instructions and reveal another user's documents.

**Block 2 (80 min).** Ask a normal question that retrieves that chunk. Confirm the answer does not follow those instructions and does not return another user's data.

**Block 3 (80 min).** Write the result in `docs/evaluation.md` under a "security checks" heading. If it failed, tighten the system prompt and the citation check, then retest.

**Done when:** the fixture cannot widen access.

**You can explain:** retrieved text is data, not instructions.

## Day 26 — Limits

**Block 1 (70 min).** Cap file size (already in `uploads.js`), question length, and chunk count per document. Return `422` with a validation key when a cap is hit.

**Block 2 (80 min).** Add `@nestjs/throttler` globally the way `NESTJS-STRUCTURE.md` describes, with a modest limit on `POST /api/chat/ask` and `POST /api/documents`.

**Block 3 (90 min).** The Documents page shows the validation message from the API. The search field shows it under the box without moving the panels off the mock layout.

**Done when:** an oversized file and an empty question both fail with your messages, not a stack trace.

**You can explain:** which limits protect cost, and which protect the database.

## Day 27 — Empty, failed, and loading states

**Block 1 (80 min).** No documents: Source Documents shows a quiet empty line inside the same card. Failed document: the row stays, with the safe error summary.

**Block 2 (80 min).** While a question is in flight, disable the search field and keep the layout stable. If the API is down, Settings and the dashboard say so.

**Block 3 (80 min).** Check the dashboard against `apps/web/UI.jpeg` at a desktop width. Adjust spacing, radius, and the mint frame only. Do not add new panels.

**Done when:** empty, failed, loading, and success all use the same frame.

**You can explain:** which state a brand-new account sees.

## Day 28 — Logs and health

**Block 1 (80 min).** Add a request id on chat and upload responses. Log method, path, status, and duration. Do not log bodies, prompts, or chunk text.

**Block 2 (70 min).** Extend `check.service.js` so `/api/health` reports API, database, and Redis. If a dependency is down, say which one without printing host passwords.

**Block 3 (90 min).** Settings already shows API health. Show the three checks there in the existing settings card.

**Done when:** stopping Redis changes the health payload and the Settings page, and the log line has no document text.

**You can explain:** what you refused to log, and why.

## Day 29 — Demo path

**Block 1 (80 min).** Write a "Demo" section in `README.md`: start Docker, API, queue worker, and web; sign in; upload; ask; show a citation; ask something the files do not contain; delete.

**Block 2 (90 min).** Run that path yourself from a clean database. Fix only blockers.

**Block 3 (70 min).** Update `docs/architecture.md` so it matches the routes you actually shipped. Delete leftover sample data if the UI no longer imports it.

**Done when:** another person could follow the README without asking you a question.

**You can explain:** the demo in the order in `enterprise-rag-assistant-architecture.md` section 11 (problem, architecture, ingestion, question, reliability, security, evaluation).

## Day 30 — Measure, then stop

**Block 1 (80 min).** Rerun `evaluate-retrieval.js`. Record retrieval Hit Rate@k, the human faithfulness count from Day 23, and a few chat latencies (retrieval vs model). Note the machine and the models.

**Block 2 (80 min).** List known limits in the README: file types you support, single-user ownership (no organizations), no reranker, sample size of the evaluation set. Do not write a performance claim you did not measure.

**Block 3 (80 min).** Visual pass on Dashboard, Documents, and Settings against `apps/web/UI.jpeg`. Fix leftover console errors. Tag the day in a short note at the bottom of `docs/evaluation.md`: what you would do next, and what you are leaving out on purpose.

**Done when:** the app runs, the dashboard matches the mock, a cited answer and an insufficient-evidence answer both work, and the README numbers are ones you measured.

**You can explain:** one decision you kept simple, and the measurement that justified leaving it simple.
