# Document authorization

Authorization is enforced in the API and in SQL. The model prompt is not a security boundary.

## Owner scope

Every document row has an `owner_id`. Authenticated requests carry the signed-in user id from the JWT (`request.user.id`).

| Endpoint | Rule | Cross-owner response |
|----------|------|----------------------|
| `GET /api/documents` | `WHERE owner_id = current user` | Other users' rows are omitted (empty list, not an error). |
| `GET /api/documents/:id` | Same owner and not `deleted` | **404** `Document was not found` |
| `GET /api/documents/:id/chunks` | Same owner and not `deleted` | **404** `Document was not found` |
| `POST /api/retrieval/search` | Join chunks to documents with `WHERE d.owner_id = current user` | Other users' chunks never appear in ranked results. |
| `POST /api/chat/ask` | Uses the same retrieval search, then grounded answer | No passages or citations from another owner's files. |

## Why 404 instead of 403

For a single document by id, a missing row and another user's row both return **404** with the same message. That avoids telling caller B whether a uuid exists on caller A's account.

List endpoints never expose foreign ids, so there is nothing to leak there.

## Tests

From `apps/api`:

```bash
npm test
```

`test/user-isolation.test.js` logs in as a second user and asserts user A's payment-note chunk text does not appear in search. It fails if the `owner_id` filter is removed from retrieval SQL or document lookups.
