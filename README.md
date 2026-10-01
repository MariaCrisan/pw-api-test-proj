# pw-api-test-proj

TypeScript API test automation framework for REST APIs with Kafka event validation, PostgreSQL assertions, JSON Schema contract checks, WireMock mocks, and Playwright Test.

## Project Status

The reusable framework and representative test suites are implemented: TypeScript/Playwright configuration, local Docker Compose definitions, validated runtime configuration, API and PostgreSQL clients, Kafka producer/consumer helpers, AJV schemas, database polling and cleanup, builders, fixtures, assertions, logging, correlation IDs, and Playwright HTML reporting.

The default suite runs without Docker. The first framework-owned API-to-Kafka-to-PostgreSQL flow has been verified locally and in GitHub Actions. Its API boundary is a self-hosted test server, so it does not yet prove integration with a deployed business service. WireMock provides a reusable inventory mapping and test helpers; Allure results, API/Kafka/database/schema attachments, and execution metadata are generated alongside the Playwright HTML report.

## Goals

- Test REST API behavior using Playwright API request fixtures.
- Validate Kafka producer and consumer flows with reusable helpers.
- Validate API responses and Kafka events using JSON Schema and AJV.
- Support end-to-end API to Kafka to PostgreSQL validation.
- Keep test data reusable through JSON fixtures, builders, and Faker.
- Provide deterministic async assertions with polling, explicit timeouts, and clear diagnostics.
- Generate Playwright HTML and Allure reports with diagnostic attachments.
- Run test groups independently locally and in CI/CD.

## Tech Stack

| Area              | Tools                          |
| ----------------- | ------------------------------ |
| Language          | TypeScript                     |
| Runtime           | Node.js, npm                   |
| Test runner       | Playwright Test                |
| API testing       | Playwright API Request Context |
| Kafka             | KafkaJS, Docker Compose        |
| Database          | PostgreSQL, node-postgres `pg` |
| Schema validation | AJV, JSON Schema               |
| Mocking           | WireMock                       |
| Test data         | Faker                          |
| Reporting         | Playwright HTML Report, Allure |
| Logging           | Pino                           |
| Configuration     | dotenv, zod                    |
| Code quality      | ESLint, Prettier               |
| CI/CD             | GitHub Actions and GitLab CI   |

## Target Project Structure

```text
root
│
├── app
│   └── src
│       ├── clients
│       │   ├── api
│       │   └── db
│       │
│       ├── db
│       │   ├── queries
│       │   └── transactions
│       │
│       ├── kafka
│       │   ├── producer
│       │   └── consumer
│       │
│       ├── schemas
│       │   ├── api
│       │   ├── kafka
│       │   └── contracts
│       │
│       ├── config
│       │
│       ├── logging
│       │
│       └── utils
│
├── tests
│   └── src
│       ├── rest-functional
│       ├── kafka
│       ├── e2e
│       ├── contracts
│       ├── negative
│       ├── retry-idempotency
│       ├── smoke-performance
│       ├── consumer-lag-timeout
│       │
│       ├── assertions
│       │   ├── api
│       │   ├── kafka
│       │   ├── database
│       │   └── schema
│       │
│       ├── fixtures
│       │   ├── api
│       │   ├── kafka
│       │   ├── db
│       │   └── contracts
│       │
│       ├── builders
│       │   ├── api
│       │   ├── kafka
│       │   └── db
│       │
│       ├── mocks
│       │   └── wiremock
│       │
│       ├── reporting
│       │
│       ├── config
│       │
│       └── utils
│
├── docker
│   ├── kafka
│   ├── postgres
│   └── wiremock
│       ├── mappings
│       └── __files
│
├── artifacts
│   ├── logs
│   ├── allure-results
│   ├── allure-report
│   ├── html-report
│   ├── requests
│   ├── responses
│   └── kafka
│
├── docs
│   ├── architecture.md
│   ├── conventions.md
│   └── testing-strategy.md
│
├── .github
│   └── workflows
│
├── .gitlab
│
├── .env.example
├── docker-compose.yml
├── package.json
├── playwright.config.ts
├── tsconfig.json
└── README.md
```

## Directory Ownership

- `app/src` contains reusable framework code: API clients, DB clients, DB query helpers, Kafka producer/consumer helpers, schemas, configuration, logging, and generic utilities.
- `tests/src` contains test suites and test-specific support: assertions, schema assertion helpers, fixtures, builders, WireMock helpers, reporting helpers, test config, and test utilities.
- `docker` contains local service assets and WireMock mappings/files.
- `artifacts` contains generated runtime output only: logs, reports, request/response payloads, and captured Kafka messages.
- `docs` contains architecture, convention, and testing strategy documentation.

## Prerequisites

- Node.js LTS
- npm
- Docker Desktop or Docker Engine with Docker Compose
- Access to the target REST API environment
- PostgreSQL access for database validation tests
- Allure CLI, if viewing Allure reports locally outside npm scripts

## Local Setup

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env
```

Start local dependencies:

```bash
npm run services:up
npm run services:wait
```

Expected local services:

- Kafka
- WireMock
- PostgreSQL
- Schema Registry, if enabled by the Kafka setup

Stop local dependencies:

```bash
npm run services:down
```

## Configuration

Shared runtime configuration should live under `app/src/config` and be loaded from environment variables using `dotenv` and validated with `zod`.

Test-runner and assertion behavior should live under `tests/src/config`.

Do not hardcode secrets, base URLs, credentials, topic names, database connection strings, or environment-specific values in test files.

Expected configuration groups:

- API base URL
- API authentication values
- Kafka broker list
- Kafka topic names
- Kafka consumer group IDs
- PostgreSQL connection settings
- WireMock URL
- Assertion timeout and polling intervals
- Report output paths

Recommended environments:

- `local`
- `dev`
- `stage`

## Test Commands

Expected npm scripts:

```bash
npm test
npm run test:api
npm run test:kafka
npm run test:e2e
npm run test:contracts
npm run test:negative
npm run test:retry-idempotency
npm run test:smoke-performance
npm run test:consumer-lag-timeout
npm run test:wiremock
```

The Kafka and end-to-end tests are opt-in so the framework-only suite remains runnable without Docker. They validate the reusable Kafka/PostgreSQL helpers through a self-hosted order API test boundary; replace that boundary with the real service before treating them as system E2E coverage. After starting and waiting for the local services, run them from PowerShell with:

```powershell
$env:RUN_INTEGRATION_TESTS = 'true'
npm run test:kafka
npm run test:e2e
Remove-Item Env:RUN_INTEGRATION_TESTS
```

The sample order flow posts an order to a test API boundary, consumes the resulting `order.created.integration` Kafka event, and polls PostgreSQL for the persisted row. Each run creates a unique marker and removes matching rows during cleanup.

WireMock tests are opt-in and require the local services:

```powershell
$env:RUN_WIREMOCK_TESTS = 'true'
npm run test:wiremock
Remove-Item Env:RUN_WIREMOCK_TESTS
```

Code quality scripts:

```bash
npm run lint
npm run format
```

## Test Types

| Test type                | Purpose                                                                                                |
| ------------------------ | ------------------------------------------------------------------------------------------------------ |
| REST functional          | Validate status codes, response bodies, headers, and schemas.                                          |
| Kafka                    | Produce and consume messages, then validate keys, headers, payloads, timestamps, and schemas.          |
| E2E                      | Call REST APIs and validate Kafka side effects and PostgreSQL state.                                   |
| Contracts                | Validate REST and Kafka contracts using JSON Schema or OpenAPI.                                        |
| Negative                 | Validate invalid payloads, missing fields, auth errors, malformed Kafka messages, and error responses. |
| Retry and idempotency    | Validate duplicate handling, retries, and no duplicate records or events.                              |
| Smoke and performance    | Run lightweight CI checks and optional threshold-based performance checks.                             |
| Consumer lag and timeout | Validate delayed consumers, timeout behavior, polling, and clear failure messages.                     |

## Test Data Strategy

Use a hybrid test data approach:

- Store reusable static payloads in `tests/src/fixtures`.
- Store fluent data builders in `tests/src/builders`.
- Store test-specific utilities in `tests/src/utils`.
- Use Faker for dynamic values such as emails, IDs, names, timestamps, addresses, and correlation IDs.
- Use seeded Faker where deterministic data is required.

Rules:

- Test files should not manually construct large payloads.
- Use builders for dynamic data.
- Use fixtures for reusable static scenarios.
- Builders may load base objects from JSON fixtures and override fields.
- Avoid hardcoded magic values inside tests.

## Adding REST API Tests

1. Add or update the reusable API client under `app/src/clients/api`.
2. Add request or response schemas under `app/src/schemas/api`.
3. Add static payloads under `tests/src/fixtures/api` when needed.
4. Add builders under `tests/src/builders/api` for dynamic payloads.
5. Add reusable assertions under `tests/src/assertions/api`.
6. Add the test under the relevant folder in `tests/src`.
7. Run the specific test group before opening a pull request.

## Adding Kafka Tests

1. Add producer logic under `app/src/kafka/producer`.
2. Add consumer logic under `app/src/kafka/consumer`.
3. Add polling and timeout assertions under `tests/src/assertions/kafka`.
4. Add event schemas under `app/src/schemas/kafka`.
5. Add reusable Kafka payload fixtures under `tests/src/fixtures/kafka`.
6. Add Kafka message builders under `tests/src/builders/kafka`.
7. Attach consumed message payloads to test reports for failure diagnostics.

## Database Validation

Database checks should use reusable PostgreSQL helpers.

Expected ownership:

- DB connection/client code lives under `app/src/clients/db`.
- DB query helpers live under `app/src/db/queries`.
- DB transaction and cleanup helpers live under `app/src/db/transactions`.
- DB assertions live under `tests/src/assertions/database`.
- DB fixtures and builders live under `tests/src/fixtures/db` and `tests/src/builders/db`.

Credentials must come from environment variables.

## WireMock

WireMock runtime assets should live under `docker/wiremock`.

- Static mappings belong in `docker/wiremock/mappings`.
- Response body files belong in `docker/wiremock/__files`.
- Test helper code for creating, resetting, or asserting stubs belongs in `tests/src/mocks/wiremock`.

`WireMockClient` resets mappings to their Docker-provided defaults before and after each test, creates test-specific stubs through the admin API, and verifies recorded requests.

## Reporting

Playwright HTML reports are written under `artifacts/html-report`; Allure result files are written under `artifacts/allure-results`. API request/response, Kafka message, PostgreSQL query, schema-input, and environment/correlation metadata attachments are included for the representative API, Kafka, and E2E flows.

Reusable reporting helpers, attachment helpers, and report metadata utilities should live under `tests/src/reporting`.

Expected artifact layout:

```text
artifacts/
  logs/
  allure-results/
  allure-report/
  html-report/
  requests/
  responses/
  kafka/
```

The target reporting design includes:

- Playwright execution summary
- Allure results and report
- API request and response payload attachments
- Kafka message payload attachments
- Schema validation errors
- Assertion failure details
- Async timeout diagnostics
- Environment information

View Playwright HTML report:

```bash
npm run report
```

Generate and view Allure report:

```bash
npm run report:allure
```

## CI/CD

GitHub Actions and GitLab CI pipelines run formatting, linting, type-checking, and each test group independently. Each test job starts Docker Compose, waits for Kafka, PostgreSQL, and WireMock, then publishes Playwright HTML, Allure results, Playwright test results, and Docker diagnostics. The `wiremock` group runs the opt-in business-stub tests.

GitHub Actions supports a `workflow_dispatch` `test_group` input. GitLab runs the same groups through a parallel matrix. GitLab CI requires a runner that permits Docker-in-Docker.

Required stages:

- install
- lint
- build
- api-tests
- kafka-tests
- contract-tests
- negative-tests
- retry-idempotency-tests
- smoke-performance-tests
- consumer-lag-timeout-tests
- e2e-tests
- report-publish

Pipeline behavior:

- Start Docker Compose services.
- Wait for Kafka readiness.
- Wait for PostgreSQL readiness.
- Wait for WireMock readiness.
- Run test suites independently.
- Publish Allure artifacts.
- Publish Playwright HTML report artifacts.
- Publish logs.
- Fail the pipeline on test failures.
- Support environment variables for different environments.
- Allow execution of specific test groups through pipeline variables.

## Design Rules

- Keep tests readable as business scenarios.
- Keep reusable app/framework helpers in `app/src` and test-specific helpers in `tests/src`.
- Keep generated output under `artifacts`; do not commit runtime logs or generated reports.
- Keep helpers generic enough for reuse without over-engineering.
- Use strict TypeScript.
- Make Kafka and database assertions deterministic with explicit polling and timeout behavior.
- Prefer clear failure messages over hidden retries.
- Add comments only when behavior is not obvious.
