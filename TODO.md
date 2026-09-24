# Main Project TODO

This is the execution checklist for the TypeScript Playwright API test automation framework. The repository currently contains requirements and planning documents only; implementation has not started.

## Current status

- [x] Confirm target stack and high-level scope.
- [x] Define target project structure.
- [x] Define test types, data strategy, reporting requirements, PostgreSQL requirements, and CI requirements.
- [ ] Implement the framework.
- [ ] Prove one reliable API → Kafka → PostgreSQL flow locally and in CI.

## Phase 0 — Architecture and decisions

- [x] Create `docs/architecture.md` with component boundaries and the API → Kafka → PostgreSQL flow.
- [x] Create `docs/conventions.md` covering naming, file organization, TypeScript, linting, formatting, and test naming.
- [x] Create `docs/testing-strategy.md` consolidating the approved test layers and execution priorities.
- [ ] Confirm the sample business domain, API endpoints, Kafka topics/events, and expected PostgreSQL tables.
- [x] Decide Kafka image/topology, broker configuration, topic creation, consumer-group strategy, and readiness checks.
- [x] Decide PostgreSQL schema/bootstrap approach and transactional cleanup strategy.
- [x] Decide environment configuration for `local`, `dev`, and `stage`.
- [x] Decide supported Node.js and npm versions.
- [x] Define the minimum local and CI acceptance criteria for the first end-to-end test.

## Phase 1 — Walking skeleton

- [x] Create `package.json` and install TypeScript, Playwright Test, KafkaJS, `pg`, AJV, WireMock support, Faker, Pino, dotenv, zod, Allure, ESLint, and Prettier.
- [x] Create strict `tsconfig.json`, `playwright.config.ts`, ESLint configuration, Prettier configuration, and `.env.example`.
- [x] Create the target `app/src` and `tests/src` directory structure.
- [x] Add typed environment/config loading with validation and safe local defaults.
- [x] Add `docker-compose.yml` for Kafka, PostgreSQL, and WireMock; add Schema Registry only if required by the chosen Kafka setup.
- [x] Add service health/readiness checks for Kafka, PostgreSQL, and WireMock.
- [x] Add the first reusable API request client and one sample REST API happy-path test.
- [x] Add initial npm scripts: `test`, `test:api`, `lint`, `format`, and report commands.
- [x] Verify the initial test and lint commands locally.

## Phase 2 — Core framework

- [x] Implement reusable API clients under `app/src/clients/api`.
- [x] Implement the PostgreSQL client under `app/src/clients/db`.
- [x] Implement query helpers under `app/src/db/queries`.
- [x] Implement transaction, cleanup, polling, and timeout helpers under `app/src/db/transactions`.
- [x] Implement Kafka producer utilities under `app/src/kafka/producer`.
- [x] Implement Kafka consumer utilities under `app/src/kafka/consumer`.
- [x] Add deterministic Kafka polling, filtering, explicit timeouts, and consumer cleanup.
- [x] Add shared logging and correlation-ID utilities under `app/src/logging` and `app/src/utils`.
- [x] Add JSON Schema validation with AJV for API, Kafka, and contract schemas.
- [ ] Add schema files under `app/src/schemas/api`, `app/src/schemas/kafka`, and `app/src/schemas/contracts`.
- [x] Add reusable API, Kafka, database, and schema assertions under `tests/src/assertions`.
- [x] Add Allure/reporting helper foundations under `tests/src/reporting`.

## Phase 3 — Test data and fixtures

- [x] Add reusable API, Kafka, database, and contract fixtures under `tests/src/fixtures`.
- [x] Add API, Kafka, and database builders under `tests/src/builders`.
- [x] Add Faker-based unique data generation.
- [x] Add seeded Faker support for deterministic scenarios.
- [x] Ensure test files do not contain large inline payloads or hardcoded magic values.
- [x] Add cleanup and isolation rules for generated test data.

## Phase 4 — First complete integration flow

- [x] Implement one REST API happy-path test.
- [x] Implement one REST API negative/error-path test.
- [x] Implement one API response JSON Schema validation test.
- [x] Implement one Kafka produce/consume test with payload and schema assertions.
- [x] Implement the critical API → Kafka → PostgreSQL end-to-end test.
- [x] Add database polling for eventual consistency and verify no duplicate records/events where relevant.
- [ ] Make the complete flow runnable locally with `npm test`.

## Phase 5 — Test type coverage

- [ ] Add at least one example in `tests/src/rest-functional`.
- [ ] Add at least one example in `tests/src/kafka`.
- [ ] Add at least one example in `tests/src/e2e`.
- [ ] Add REST and Kafka contract tests in `tests/src/contracts`.
- [ ] Add invalid payload, missing-field, authentication, and malformed-message tests in `tests/src/negative`.
- [ ] Add retry, duplicate request, duplicate event, and idempotency tests in `tests/src/retry-idempotency`.
- [ ] Add lightweight smoke and threshold-based performance checks in `tests/src/smoke-performance`.
- [ ] Add consumer lag, delayed-consumer, timeout, and diagnostic-message tests in `tests/src/consumer-lag-timeout`.
- [ ] Add a short README to each test-type directory.
- [ ] Add independent npm scripts for every test group.

## Phase 6 — WireMock, reporting, and diagnostics

- [ ] Add WireMock mappings and response files under `docker/wiremock/mappings` and `docker/wiremock/__files`.
- [ ] Add WireMock reset/stub/assertion helpers under `tests/src/mocks/wiremock`.
- [ ] Add Allure steps and attachments for API requests/responses, Kafka payloads, SQL results, schemas, and failures.
- [ ] Configure Playwright HTML and Allure output under `artifacts`.
- [ ] Add correlation IDs and environment metadata to logs and reports.
- [ ] Ensure logs and reports include actionable timeout and polling diagnostics.
- [ ] Keep generated artifacts out of source-controlled implementation files.

## Phase 7 — CI/CD

- [ ] Create the GitHub Actions workflow.
- [ ] Create the GitLab CI pipeline.
- [ ] Add install, lint, build/type-check, and dependency readiness stages.
- [ ] Start Docker Compose services in CI.
- [ ] Run API, Kafka, contract, negative, retry/idempotency, smoke/performance, consumer-lag/timeout, and E2E groups independently.
- [ ] Allow selection of test groups through CI variables or workflow inputs.
- [ ] Publish Playwright HTML, Allure, logs, and diagnostic artifacts.
- [ ] Fail pipelines on test, readiness, lint, or type-check failures.
- [ ] Configure environment-specific variables and keep secrets in CI secret storage.
- [ ] Verify the first complete flow in both local execution and CI.

## Phase 8 — Hardening and documentation

- [ ] Run lint, format checks, type-checking, and all test groups; fix failures.
- [ ] Remove flaky fixed sleeps and replace them with polling and explicit deadlines.
- [ ] Verify Kafka, database, WireMock, and test cleanup after failures.
- [ ] Review parallel execution, resource usage, and test isolation.
- [ ] Align README commands and structure with the implemented project.
- [ ] Document exact local setup, service startup, test commands, report commands, and troubleshooting.
- [ ] Add templates or generators only after real test usage exposes repetition.
- [ ] Review scope before considering deferred items such as custom DSLs, multi-database support, Kubernetes, k6/Gatling, or AI-generated tests.

## Definition of done

- [ ] `npm install` completes from a clean checkout.
- [ ] Configuration is validated and no secrets, URLs, credentials, or topic names are hardcoded.
- [ ] `npm run lint`, type-checking, and formatting checks pass.
- [ ] `npm test` runs the intended suite and produces Playwright/Allure results.
- [ ] The API → Kafka → PostgreSQL example passes locally and in CI.
- [ ] Each required test type has at least one runnable example and independent command.
- [ ] Failures provide request, response, Kafka, SQL, schema, log, and timeout diagnostics where applicable.
- [ ] README and architecture documentation match the implemented structure.

## Deferred backlog

- [ ] Custom test DSLs.
- [ ] Plugin systems.
- [ ] Multi-database support.
- [ ] Kubernetes deployment support.
- [ ] Dedicated performance frameworks such as k6 or Gatling.
- [ ] AI-generated test cases.
