# pw-api-test-proj

TypeScript API test automation framework for REST APIs with Kafka event validation, PostgreSQL assertions, JSON Schema contract checks, WireMock mocks and Playwright Test.

## Project Status

This repository currently contains the framework requirements, target project structure, test strategy, and implementation plan. The source files, Docker Compose setup, Playwright configuration, npm scripts, and CI pipelines should be added according to the structure documented here.

## Goals

- Test REST API behavior using Playwright API request fixtures.
- Validate Kafka producer and consumer flows with reusable helpers.
- Validate API responses and Kafka events using JSON Schema and AJV.
- Support end-to-end API to Kafka to PostgreSQL validation.
- Keep test data reusable through JSON fixtures, builders, and Faker.
- Provide deterministic async assertions with polling, explicit timeouts, and clear diagnostics.
- Generate Playwright HTML and Allure reports.
- Run test groups independently in local development and CI/CD.

## Tech Stack

| Area | Tools |
| --- | --- |
| Language | TypeScript |
| Test runner | Playwright Test |
| API testing | Playwright API Request Context |
| Kafka | KafkaJS, Docker Compose |
| Database | PostgreSQL, node-postgres `pg` |
| Schema validation | AJV, JSON Schema |
| Mocking | WireMock |
| Reporting | Allure, Playwright HTML Report |
| Logging | Pino |
| Configuration | dotenv, zod |
| Code quality | ESLint, Prettier |
| CI/CD | GitHub Actions, GitLab CI |

## Target Project Structure

```text
root
|
+-- src
|   +-- clients
|   |   +-- api
|   |   +-- db
|   |
|   +-- kafka
|   |   +-- producer
|   |   +-- consumer
|   |   +-- assertions
|   |
|   +-- assertions
|   |   +-- api
|   |   +-- kafka
|   |   +-- database
|   |
|   +-- schemas
|   |   +-- api
|   |   +-- kafka
|   |   +-- contracts
|   |
|   +-- fixtures
|   |   +-- api
|   |   +-- kafka
|   |   +-- db
|   |   +-- contracts
|   |
|   +-- builders
|   |   +-- api
|   |   +-- kafka
|   |   +-- db
|   |
|   +-- config
|   +-- reporting
|   +-- logging
|   +-- utils
|
+-- tests
|   +-- rest-functional
|   +-- kafka
|   +-- e2e
|   +-- contracts
|   +-- negative
|   +-- retry-idempotency
|   +-- smoke-performance
|   +-- consumer-lag-timeout
|
+-- docker
+-- artifacts
+-- .github
+-- .gitlab
+-- README.md
```

## Prerequisites

- Node.js LTS
- npm
- Docker Desktop or Docker Engine with Docker Compose
- Access to the target REST API environment
- PostgreSQL access for database validation tests
- Allure CLI, if viewing Allure reports locally outside npm scripts

## Setup

Install dependencies:

```bash
npm install
```

Create a local environment file from the example file once it exists:

```bash
cp .env.example .env
```

Start local dependencies:

```bash
docker compose up -d
```

Expected local services:

- Kafka
- WireMock
- PostgreSQL, if running database checks locally
- Schema Registry, if enabled by the Kafka setup

Stop local dependencies:

```bash
docker compose down
```

## Configuration

Configuration should be loaded from environment variables using `dotenv` and validated with `zod`.

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

## Running Tests

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
```

Code quality scripts:

```bash
npm run lint
npm run format
```

## Test Types

| Test type | Purpose |
| --- | --- |
| REST functional | Validate status codes, response bodies, headers, and schemas. |
| Kafka | Produce and consume messages, then validate keys, headers, payloads, timestamps, and schemas. |
| E2E | Call REST APIs and validate Kafka side effects and PostgreSQL state. |
| Contracts | Validate REST and Kafka contracts using JSON Schema or OpenAPI. |
| Negative | Validate invalid payloads, missing fields, auth errors, malformed Kafka messages, and error responses. |
| Retry and idempotency | Validate duplicate handling, retries, and no duplicate records or events. |
| Smoke and performance | Run lightweight CI checks and optional threshold-based performance checks. |
| Consumer lag and timeout | Validate delayed consumers, timeout behavior, polling, and clear failure messages. |

## Test Data Strategy

Use a hybrid test data approach:

- Store reusable static payloads in `src/fixtures`.
- Store fluent data builders in `src/builders`.
- Use Faker for dynamic values such as emails, IDs, names, timestamps, addresses, and correlation IDs.
- Use seeded Faker where deterministic data is required.

Rules:

- Test files should not manually construct large payloads.
- Use builders for dynamic data.
- Use fixtures for reusable static scenarios.
- Builders may load base objects from JSON fixtures and override fields.
- Avoid hardcoded magic values inside tests.

## Adding REST API Tests

1. Add or update the reusable API client under `src/clients/api`.
2. Add request or response schemas under `src/schemas/api`.
3. Add static payloads under `src/fixtures/api` when needed.
4. Add builders under `src/builders/api` for dynamic payloads.
5. Add reusable assertions under `src/assertions/api`.
6. Add the test under the relevant folder in `tests`.
7. Run the specific test group before opening a pull request.

## Adding Kafka Assertions

1. Add producer logic under `src/kafka/producer`.
2. Add consumer logic under `src/kafka/consumer`.
3. Add polling and timeout assertions under `src/kafka/assertions` or `src/assertions/kafka`.
4. Add event schemas under `src/schemas/kafka`.
5. Add reusable Kafka payload fixtures under `src/fixtures/kafka`.
6. Add Kafka message builders under `src/builders/kafka`.
7. Attach consumed message payloads to test reports for failure diagnostics.

## Database Validation

Database checks should use reusable PostgreSQL helpers.

Expected support:

- Shared database client
- Query helper layer
- Database assertion helper layer
- Transactional cleanup
- Polling assertions for eventual consistency
- Validation of records created by Kafka consumers
- Environment-specific connection configuration

Credentials must come from environment variables.

## Reporting

Reports and diagnostics should be written under `artifacts`.

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

Reports should include:

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

CI pipelines should support GitHub Actions and GitLab CI.

Required stages:

- install
- lint
- build
- smoke-tests
- api-tests
- kafka-tests
- contract-tests
- e2e-tests
- report-publish

Pipeline behavior:

- Start Docker Compose services.
- Wait for Kafka readiness.
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
- Put reusable plumbing in `src`, not inside test files.
- Keep helpers generic enough for reuse without over-engineering.
- Use strict TypeScript.
- Make Kafka and database assertions deterministic with explicit polling and timeout behavior.
- Prefer clear failure messages over hidden retries.
- Add comments only when behavior is not obvious.
