```text
Create a TypeScript API test automation framework for REST APIs with Kafka event validation.

Tech stack:
- Language: TypeScript
- Runtime/package manager: Node.js with npm
- Test runner: Playwright Test
- API testing: Playwright request fixture
- Kafka: Local Docker Compose Kafka setup
- Kafka utilities: reusable producer and consumer helpers
- Schema validation: JSON Schema using AJV
- Mocking: WireMock
- Reporting: Playwright HTML report + Allure report
- CI/CD: GitHub Actions and GitLab CI
- Logging: pino
- Config management: dotenv + typed config validation with zod
- Containers: Docker Compose for Kafka, PostgreSQL, WireMock, and optional Schema Registry

Framework requirements:
1. Generate a clean modular project structure with separate app/src and tests/src roots.
2. Include reusable REST API client utilities under app/src/clients/api.
3. Include reusable PostgreSQL client utilities under app/src/clients/db.
4. Include reusable PostgreSQL query helpers under app/src/db/queries.
5. Include reusable PostgreSQL transaction and cleanup helpers under app/src/db/transactions.
6. Include reusable Kafka producer utilities under app/src/kafka/producer.
7. Include reusable Kafka consumer utilities under app/src/kafka/consumer.
8. Support producing test messages to Kafka topics.
9. Support consuming Kafka messages and asserting payload content.
10. Support validating Kafka message payloads against JSON Schema.
11. Support REST API response schema validation using JSON Schema.
12. Add WireMock support for mocking downstream REST dependencies.
13. Add environment-based config for local, dev, and stage.
14. Add test data builders and JSON fixtures under tests/src.
15. Add test-specific assertions under tests/src/assertions.
16. Add schema assertion helpers under tests/src/assertions/schema.
17. Add reporting helpers under tests/src/reporting and generated output under artifacts.
18. Add sample tests:
    - REST API happy-path test
    - REST API negative test
    - API response JSON Schema validation test
    - Kafka produce/consume test
    - End-to-end REST API call followed by Kafka and PostgreSQL validation
    - WireMock-backed API test
19. Add Docker Compose setup for:
    - Kafka
    - PostgreSQL
    - WireMock
    - Schema Registry if useful for the chosen setup
20. Add npm scripts for:
    - test
    - test:api
    - test:kafka
    - test:e2e
    - test:contracts
    - test:negative
    - test:retry-idempotency
    - test:smoke-performance
    - test:consumer-lag-timeout
    - report
    - report:allure
    - lint
    - format
21. Add ESLint and Prettier.
22. Add GitHub Actions and GitLab CI pipelines that:
    - install dependencies
    - start Docker Compose services
    - wait for Kafka readiness
    - wait for PostgreSQL readiness
    - wait for WireMock readiness
    - run lint
    - run test groups independently
    - upload Playwright and Allure reports as artifacts

Suggested project structure:
- app/src/
  - clients/api/
  - clients/db/
  - db/queries/
  - db/transactions/
  - kafka/producer/
  - kafka/consumer/
  - schemas/api/
  - schemas/kafka/
  - schemas/contracts/
  - config/
  - logging/
  - utils/
- tests/src/
  - rest-functional/
  - kafka/
  - e2e/
  - contracts/
  - negative/
  - retry-idempotency/
  - smoke-performance/
  - consumer-lag-timeout/
  - assertions/api/
  - assertions/kafka/
  - assertions/database/
  - assertions/schema/
  - fixtures/api/
  - fixtures/kafka/
  - fixtures/db/
  - fixtures/contracts/
  - builders/api/
  - builders/kafka/
  - builders/db/
  - mocks/wiremock/
  - reporting/
  - config/
  - utils/
- docker/kafka/
- docker/postgres/
- docker/wiremock/mappings/
- docker/wiremock/__files/
- artifacts/
- docs/
- .github/workflows/
- .gitlab/
- .env.example
- docker-compose.yml
- package.json
- playwright.config.ts
- tsconfig.json
- README.md

Design constraints:
- Do not hardcode secrets, URLs, topic names, or credentials.
- Use environment variables with sensible local defaults.
- Make async Kafka and database assertions deterministic using polling and explicit timeouts.
- Keep generated logs and reports under artifacts.
- Keep code simple and maintainable.
- Avoid over-engineering.
- Include comments only where they clarify non-obvious behavior.
- Use strict TypeScript.
- Every sample test should be runnable locally.
- After implementation, run lint and tests, then fix any failures.

Before coding:
1. Use project-structure.md as the source of truth.
2. Explain key design choices briefly.
3. Then implement the framework in phases.
4. After implementation, show the exact commands to run it locally.
```

Recommended phases:

```text
Phase 1:
Implement only the initial TypeScript Playwright API test framework skeleton with config management, linting, formatting, README alignment, Docker Compose for Kafka/PostgreSQL/WireMock, and one sample REST API test. Do not implement all Kafka helpers yet. Make sure npm test and npm run lint pass.
```

```text
Phase 2:
Add reusable Kafka producer and consumer utilities, JSON Schema validation with AJV, and one Kafka produce/consume test using the local Docker Compose Kafka service. Add clear polling and timeout behavior.
```

```text
Phase 3:
Add PostgreSQL query helpers, transaction cleanup helpers, and an end-to-end test that calls a REST API endpoint and validates the expected Kafka side-effect and DB state.
```

```text
Phase 4:
Add WireMock support for downstream mock APIs, report attachments for API/Kafka/DB diagnostics, and CI pipelines for GitHub Actions and GitLab CI.
```
