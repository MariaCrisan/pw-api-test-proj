# Conventions

## TypeScript

- Use strict TypeScript and type-only imports where applicable.
- Use named exports for reusable helpers.
- Keep reusable code focused; do not add generic abstractions without a second real use case.
- Use `async`/`await` for asynchronous workflows and make resource lifecycle methods explicit.
- Fail with contextual errors that identify the affected service, topic, endpoint, or timeout.

## Naming and placement

- Use kebab-case filenames, such as `kafka-consumer.ts` and `health.spec.ts`.
- Name Playwright files `*.spec.ts`.
- Put reusable production-facing helpers in `app/src`.
- Put test-only assertions, builders, fixtures, and reporting helpers in `tests/src`.
- Keep all Kafka implementation under `app/src/kafka`.

## Tests

- Test names describe observable business behavior, not implementation details.
- Tests create their own data and must not depend on execution order.
- Prefer builders and fixtures over large inline JSON payloads.
- Use a generated correlation ID to connect API calls, Kafka events, database rows, and diagnostics.
- Use polling with explicit deadlines for eventual consistency; do not use fixed sleeps as synchronization.
- Dispose API request contexts, Kafka clients, and database connections in teardown.

## Configuration and security

- Validate configuration before use.
- Keep defaults limited to local development.
- Store `.env` files, certificates, and credentials outside version control.
- Store `dev` and `stage` secrets in CI secret storage.
- Redact credentials, tokens, and sensitive payload fields before attaching diagnostics.

## Quality gates

- Format code with Prettier.
- Run ESLint before commit.
- Run `npm run typecheck` before commit.
- Run the relevant test group before commit; run `npm test` before merging.
