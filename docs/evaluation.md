# Retrieval evaluation

This file records offline retrieval checks. Answer quality (grounded chat) is measured separately in Day 21 tests and in manual UI checks.

## Why retrieval is measured on its own

Retrieval decides **which passages** the model is allowed to see. If the wrong document never appears in the top `k` results, the chat step cannot cite it honestly, no matter how good the model is. Measuring Hit Rate@`k` first tells you whether indexing, embeddings, and chunking are working before you tune prompts or the reader.

## Question set

File: `evals/questions.jsonl`

- 12 questions total
- 10 expect a specific uploaded file (`expectedDocument` is the original filename)
- 4 literal wording from the corpus, 6 paraphrased
- 2 questions with `expectedDocument: null` (no answer in the corpus)

Corpus used for the run below (owner `imran@localhost`, documents in `ready` status):

- `Project_Phoenix.pdf` (payment / reconciliation note)
- `harbor-audit.pdf`
- `west-dock.docx`

## How to rerun

From `apps/api`:

```bash
npm run evaluate:retrieval
```

Optional environment:

- `EVAL_OWNER_ID` — defaults to the development seed user
- `EVAL_TOP_K` — defaults to `4` (same as web search unless `RETRIEVAL_TOP_K` overrides)
- `RETRIEVAL_TOP_K` — if set, the script uses it when `EVAL_TOP_K` is not set

The script prints one line per question (`hit` / `miss` / `unanswerable`) and a summary:

`Hit Rate@k: <rate> (<hits>/<answerable>)`

Only rows with an `expectedDocument` count toward the denominator. Unanswerable rows are listed but not scored.

## Latest run

| Date | Top k | Hit Rate@k | Hits | Answerable questions | Notes |
|------|-------|------------|------|----------------------|-------|
| 2026-10-29 | 4 | 1.000 | 10 | 10 | Chunk size unchanged (500 / 50 overlap). Local MiniLM embeddings, MySQL 8 JSON vectors. |

Command: `npm run evaluate:retrieval` on branch `day-22-evaluation-set`.

## Answer review (human)

Ten questions from the first lines of `evals/questions.jsonl` were checked against live `POST /api/chat/ask` behavior (same owner and corpus as retrieval). For each answer I marked:

- **Faithful** — the answer is supported by retrieved passages, or correctly refuses when the corpus has no answer.
- **Citations match** — every citation quote overlaps the answer text; insufficient-evidence rows have an empty reference list.

Rerun the helper from `apps/api`:

```bash
npm run review:answers
```

### Counts (2026-10-30)

| Review date | Questions | Faithful | Not faithful | Citations match | Insufficient handled correctly |
|-------------|-----------|----------|--------------|-----------------|------------------------------|
| 2026-10-30 | 10 | 10 | 0 | 10 | 1 / 1 unanswerable in the set |

Retrieval was **not** rerun after the answer fix (chunk size and search SQL unchanged).

### Fix applied during review

Before the fix, **“What should we do after a failed reconciliation job?”** was marked **not faithful**: retrieval returned the payment note, but the local reader treated it as insufficient because **“failed”** in the question did not match **“fails”** in the passage. **Stem-style overlap** in `complete-answer.js` (`failed` / `fails` share a stem) fixed that paraphrase without changing retrieval or chunk size.

### One question the system had missed (before the fix)

**Question:** What should we do after a failed reconciliation job?

**Why:** Retrieval was correct; the reader’s word overlap was too literal, so the API returned the insufficient-evidence sentence even though the payment note answers the question. That is an **answer-generation** failure, not a retrieval failure — which is why both metrics are recorded separately in this file.
