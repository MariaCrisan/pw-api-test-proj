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
- CI/CD: GitHub Actions
- Logging: pino or winston
- Config management: dotenv + typed config validation
- Containers: Docker Compose for Kafka, Schema Registry, WireMock, and any local test dependencies

Framework requirements:
1. Generate a clean modular project structure.
2. Include reusable REST API client utilities.
3. Include reusable Kafka producer utilities.
4. Include reusable Kafka consumer utilities with polling, timeout, retries, and clear failure messages.
5. Support producing test messages to Kafka topics.
6. Support consuming Kafka messages and asserting payload content.
7. Support validating Kafka message payloads against JSON Schema.
8. Support REST API response schema validation using JSON Schema.
9. Add WireMock support for mocking downstream REST dependencies.
10. Add environment-based config for local, dev, and stage.
11. Add test data builders and JSON fixtures.
12. Add sample tests:
    - REST API happy-path test
    - REST API negative test
    - API response JSON Schema validation test
    - Kafka produce/consume test
    - End-to-end REST API call followed by Kafka side-effect validation
    - WireMock-backed API test
13. Add Docker Compose setup for:
    - Kafka
    - Zookeeper or Kraft mode Kafka, whichever is simpler and stable
    - Schema Registry if useful for the chosen setup
    - WireMock
14. Add npm scripts for:
    - install
    - test
    - test:api
    - test:kafka
    - test:e2e
    - report
    - lint
    - format
15. Add ESLint and Prettier.
16. Add README with:
    - prerequisites
    - setup
    - Docker startup commands
    - config explanation
    - how to run tests
    - how to view reports
    - how to add new API tests
    - how to add new Kafka assertions
17. Add GitHub Actions pipeline that:
    - installs dependencies
    - starts Docker Compose services
    - runs lint
    - runs tests
    - uploads Playwright and Allure reports as artifacts

Suggested project structure:
- src/
  - config/
  - clients/
  - kafka/
  - schemas/
  - fixtures/
  - builders/
  - mocks/
  - assertions/
  - utils/
- tests/
  - api/
  - kafka/
  - e2e/
- docker/
- .github/workflows/
- playwright.config.ts
- docker-compose.yml
- package.json
- README.md

Design constraints:
- Do not hardcode secrets, URLs, topic names, or credentials.
- Use environment variables with sensible local defaults.
- Make async Kafka assertions deterministic using polling and explicit timeouts.
- Keep code simple and maintainable.
- Avoid over-engineering.
- Include comments only where they clarify non-obvious behavior.
- Use strict TypeScript.
- Every sample test should be runnable locally.
- After implementation, run lint and tests, then fix any failures.

Before coding:
1. Propose the project structure.
2. Explain key design choices briefly.
3. Then implement the framework.
4. After implementation, show the exact commands to run it locally.
```

I’d run this in **phases**, not one monster task. First Codex prompt should be:

```text
Implement only the initial TypeScript Playwright API test framework skeleton with config management, linting, formatting, README, Docker Compose for Kafka and WireMock, and one sample REST API test. Do not implement all Kafka helpers yet. Make sure npm test and npm run lint pass.
```

Then second prompt:

```text
Add reusable Kafka producer and consumer utilities, JSON Schema validation with AJV, and one Kafka produce/consume test using the local Docker Compose Kafka service. Add clear polling and timeout behavior.
```

Then third:

```text
Add an end-to-end test that calls a REST API endpoint and validates the expected Kafka side-effect message. Add WireMock support for downstream mock APIs and document the flow in README.
```

