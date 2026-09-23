Test type organization:

Create clear separation between test types, while keeping shared logic reusable.

Use this test suite structure:

tests/
  src/
    rest-functional/
    kafka/
    e2e/
    contracts/
    negative/
    retry-idempotency/
    smoke-performance/
    consumer-lag-timeout/

Reusable app/framework code lives under app/src:

app/
  src/
    clients/
      api/
      db/
    db/
      queries/
      transactions/
    kafka/
      producer/
      consumer/
    schemas/
      api/
      kafka/
      contracts/
    config/
    logging/
    utils/

Reusable test-specific code lives under tests/src:

tests/
  src/
    assertions/
      api/
      kafka/
      database/
      schema/
    fixtures/
      api/
      kafka/
      db/
      contracts/
    builders/
      api/
      kafka/
      db/
    mocks/
      wiremock/
    reporting/
    config/
    utils/

Test type requirements:

1. REST API functional tests
   - Validate status codes, response bodies, headers, and JSON schemas.
   - Use reusable API clients and assertion helpers.

2. Kafka producer/consumer validation
   - Produce test messages to Kafka topics.
   - Consume messages from Kafka topics.
   - Validate payload, headers, keys, timestamps, and JSON schema.

3. End-to-end API -> Kafka -> DB checks
   - Call REST API.
   - Wait for expected Kafka event.
   - Validate resulting DB state.
   - Use reusable API, Kafka, and DB helpers.

4. Contract tests
   - Validate REST API contracts using JSON Schema or OpenAPI.
   - Validate Kafka event contracts using JSON Schema.
   - Keep schemas versioned and reusable.

5. Negative/error-path tests
   - Validate bad requests, invalid payloads, auth errors, missing fields, malformed Kafka messages, and expected error responses.

6. Retry/idempotency tests
   - Validate retry behavior.
   - Validate duplicate request handling.
   - Validate duplicate Kafka message handling.
   - Assert no duplicate DB records/events are created.

7. Performance/smoke tests
   - Include lightweight smoke tests suitable for CI.
   - Include optional performance checks with configurable thresholds.
   - Keep performance tests clearly separated from normal functional tests.

8. Consumer lag or timeout validation
   - Validate behavior when Kafka consumers are delayed.
   - Validate timeout handling and clear failure messages.
   - Include helpers for polling, lag checks, and max-wait assertions.

Rules:
- Tests must be clearly grouped by purpose.
- Reusable app/framework helpers must live under app/src.
- Reusable test-specific helpers must live under tests/src.
- Test files should read like business scenarios, not low-level plumbing.
- Shared helpers must be generic enough for reuse but not over-engineered.
- Each test type must have at least one example test.
- Each test folder must include a short README explaining its purpose.
- Add npm scripts to run each test group independently.
