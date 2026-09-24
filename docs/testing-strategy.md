# Testing Strategy

## Test layers

| Layer                | Primary purpose                                                             | Execution expectation                              |
| -------------------- | --------------------------------------------------------------------------- | -------------------------------------------------- |
| REST functional      | Validate status, headers, body, and response schema.                        | Fast and independent.                              |
| Kafka                | Validate produced/consumed keys, headers, payloads, timestamps, and schema. | Uses isolated consumer groups and correlation IDs. |
| E2E                  | Validate REST API side effects in Kafka and PostgreSQL.                     | Deterministic polling and explicit cleanup.        |
| Contract             | Validate API and event contracts.                                           | Uses versioned JSON schemas initially.             |
| Negative             | Validate invalid input, authorization, and expected failures.               | Independent of happy-path test data.               |
| Retry/idempotency    | Validate duplicate handling and absence of duplicate side effects.          | Uses unique request and correlation IDs.           |
| Smoke/performance    | Provide fast deployment confidence and lightweight thresholds.              | Suitable for CI.                                   |
| Consumer lag/timeout | Validate delayed processing and useful timeout diagnostics.                 | Uses controlled deadlines.                         |

## Execution order

1. Type-check, format check, and lint.
2. REST and unit-style framework tests.
3. Kafka and contract tests after service readiness succeeds.
4. E2E tests after Kafka and PostgreSQL are ready.
5. Publish diagnostics and reports.

## Test data and cleanup

- Use static fixtures for stable scenarios and builders for dynamic scenarios.
- Generate unique test IDs and correlation IDs for every test run.
- Prefer a test-run marker in created records over broad table deletion.
- Execute cleanup in teardown and report cleanup failures separately from assertion failures.
- Do not delete shared Kafka topics during normal test runs.

## Diagnostics

On failure, tests should eventually attach or log:

- HTTP request and response details.
- Kafka topic, partition, offset, key, headers, and payload.
- Database query context and returned rows.
- Schema validation errors.
- Correlation IDs, elapsed time, polling attempts, and timeout settings.

Playwright HTML reports are available now. Allure attachments and richer diagnostics are planned for the reporting phase.
