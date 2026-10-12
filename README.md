# pw-api-test-proj

TypeScript API test automation framework using Playwright Test, with Kafka event validation,
PostgreSQL assertions, JSON Schema contracts, and WireMock stubs.

The repository includes reusable clients and representative order scenarios. The default suite runs
without Docker: REST tests start local HTTP servers, and framework tests use in-process doubles.
Kafka, PostgreSQL, and WireMock integrations are opt-in. The E2E example also starts its own order API;
validating a deployed business service requires adapting that boundary and its contracts.

## Quick start

Prerequisites:

- Node.js 20+ and npm 10+ (GitHub Actions uses Node.js 22).
- Docker Engine or Docker Desktop with Docker Compose for integration tests.
- Java on `PATH` for generating or opening Allure HTML reports (CI uses Java 17).

From the repository root:

```bash
npm ci
npm test
```

Browser installation is unnecessary for the current API-only tests. With the opt-in flags unset,
Kafka/E2E integration scenarios and WireMock tests are skipped; Kafka helper tests still run.

On Windows, use `npm.cmd` and `npx.cmd` if PowerShell blocks the corresponding `.ps1` wrappers.

## Local integration tests

Optionally copy the local configuration template:

```bash
cp .env.example .env
```

PowerShell equivalent:

```powershell
Copy-Item .env.example .env
```

The committed defaults work with Compose without a `.env` file. Keep `.env` uncommitted.
`services:wait` loads it automatically, but the test runner does not. The commands below preload
`dotenv/config` so customized `.env` values are also available to tests. Existing shell environment
variables take precedence over `.env`.

Start the services and check readiness:

```bash
npm run services:up
npm run services:wait
```

| Service    | Local endpoint   | Implementation                             |
| ---------- | ---------------- | ------------------------------------------ |
| Kafka      | `localhost:9092` | Confluent Kafka 7.7.1, single KRaft broker |
| PostgreSQL | `localhost:5432` | PostgreSQL 16.4; database `api_test`       |
| WireMock   | `localhost:8080` | WireMock 3.9.1 with committed mappings     |

Compose initializes `framework_health` and `orders` tables. Readiness checks use Kafka administrative
access, a PostgreSQL `SELECT 1`, and the WireMock admin endpoint. Schema Registry is not included;
events use JSON.

Run Kafka, E2E, and WireMock groups in Bash:

```bash
NODE_OPTIONS='--require=dotenv/config' RUN_INTEGRATION_TESTS=true npm run test:kafka
NODE_OPTIONS='--require=dotenv/config' RUN_INTEGRATION_TESTS=true npm run test:e2e
NODE_OPTIONS='--require=dotenv/config' RUN_WIREMOCK_TESTS=true npm run test:wiremock
```

Or run the entire suite, including integrations, in PowerShell:

```powershell
$previousNodeOptions = $env:NODE_OPTIONS
$env:NODE_OPTIONS = "$previousNodeOptions --require=dotenv/config".Trim()
$env:RUN_INTEGRATION_TESTS = 'true'
$env:RUN_WIREMOCK_TESTS = 'true'
try {
    npm test
} finally {
    $env:NODE_OPTIONS = $previousNodeOptions
    Remove-Item Env:RUN_INTEGRATION_TESTS, Env:RUN_WIREMOCK_TESTS
}
```

Both flags require the exact value `true`. Selecting an integration group alone does not enable its
skipped scenarios.

Stop local services when finished:

```bash
npm run services:down
```

### Sample order flow

The [E2E scenario](tests/src/e2e/order-flow.integration.spec.ts) exercises these steps:

1. Provision the `orders.created.integration` Kafka topic and ensure the `orders` table exists.
2. Start a local order API and connect the Kafka producer, consumer, and PostgreSQL client.
3. Submit `POST /orders` with an order payload and correlation ID.
4. The test API callback publishes an event and inserts the order into PostgreSQL.
5. Consume the matching event, check its key/header/payload, poll for the row, and assert one matching
   database record.
6. Dispose connections, stop the API server, and remove rows matching the test marker.

The standalone [Kafka integration](tests/src/kafka/order-created.integration.spec.ts) uses the same
topic and validates the event payload with AJV. These examples exercise framework integrations;
they do not establish production delivery guarantees or deployed-service behavior.

## Test commands and coverage

| Command                             | Current coverage                                                                                  | Service requirement                                    |
| ----------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `npm test`                          | All test files, including builder and DB transaction helper tests                                 | None by default; flags enable integrations             |
| `npm run test:api`                  | Local health/order endpoints, valid and invalid responses, response schema                        | None                                                   |
| `npm run test:kafka`                | Kafka configuration, event envelopes, producer/consumer helpers; optional real message round trip | Kafka and `RUN_INTEGRATION_TESTS=true` for integration |
| `npm run test:e2e`                  | Self-hosted order API to Kafka to PostgreSQL                                                      | Kafka, PostgreSQL, and `RUN_INTEGRATION_TESTS=true`    |
| `npm run test:contracts`            | REST response and Kafka payload JSON Schema validation                                            | None                                                   |
| `npm run test:negative`             | Missing fields, missing authorization, malformed HTTP JSON                                        | None                                                   |
| `npm run test:retry-idempotency`    | Duplicate order request invokes the local acceptance callback once                                | None                                                   |
| `npm run test:smoke-performance`    | One local order request under a 1,000 ms latency threshold                                        | None                                                   |
| `npm run test:consumer-lag-timeout` | Consumer timeout diagnostics, delayed delivery, disconnect cancellation using doubles             | None                                                   |
| `npm run test:wiremock`             | Default inventory mapping, dynamic failure stub, recorded request verification                    | WireMock and `RUN_WIREMOCK_TESTS=true`                 |

The smoke check is a lightweight latency assertion. Broker lag measurement and sustained load testing
are outside the current examples. Contract tests use JSON Schema, with no OpenAPI validation.

To run one file or select a named scenario:

```bash
npx playwright test tests/src/rest-functional/orders.spec.ts
npx playwright test --grep "accepts a valid order"
```

Playwright enables parallel execution and uses a 30-second test timeout. CI forbids focused tests
(`test.only`) and retries failures once; local runs have no retries. WireMock scenarios run serially
because mapping resets affect the whole service.

Quality checks:

```bash
npm run format:check
npm run lint
npm run typecheck
```

`npm run format` rewrites formatting across the repository. Type-checking uses `tsc --noEmit`; there
is no build step or compiled application output.

## Configuration

[Runtime configuration](app/src/config/environment.ts) reads environment variables and validates
values with zod. `APP_ENV` labels the execution environment; it does not select a separate env file.

| Variable                              | Default                 | Purpose                                                              |
| ------------------------------------- | ----------------------- | -------------------------------------------------------------------- |
| `APP_ENV`                             | `local`                 | Allowed values: `local`, `dev`, `stage`                              |
| `API_BASE_URL`                        | `http://localhost:8080` | Shared API configuration; sample HTTP tests use their own server URL |
| `KAFKA_CLIENT_ID`                     | `pw-api-test-framework` | Kafka client identifier                                              |
| `KAFKA_BROKERS`                       | `localhost:9092`        | Comma-separated broker addresses                                     |
| `KAFKA_SSL`                           | `false`                 | Kafka TLS setting (`true` or `false`)                                |
| `POSTGRES_HOST` / `POSTGRES_PORT`     | `localhost` / `5432`    | Database address                                                     |
| `POSTGRES_DATABASE`                   | `api_test`              | Database name                                                        |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` | `api_test` / `api_test` | Local database credentials                                           |
| `WIREMOCK_BASE_URL`                   | `http://localhost:8080` | WireMock API and admin endpoint                                      |
| `ASSERTION_TIMEOUT_MS`                | `15000`                 | Integration wait timeout                                             |
| `ASSERTION_POLL_INTERVAL_MS`          | `250`                   | Database polling interval                                            |
| `RUN_INTEGRATION_TESTS`               | Unset                   | Enable Kafka and E2E integration scenarios with `true`               |
| `RUN_WIREMOCK_TESTS`                  | Unset                   | Enable WireMock tests with `true`                                    |
| `SERVICE_READINESS_TIMEOUT_MS`        | `60000`                 | Readiness timeout per service                                        |
| `SERVICE_READINESS_POLL_INTERVAL_MS`  | `1000`                  | Delay between readiness attempts                                     |
| `LOG_LEVEL`                           | `info`                  | Pino logging level                                                   |

The reusable [Kafka connection helpers](app/src/kafka/config.ts) also support
`KAFKA_SASL_MECHANISM` (`plain`, `scram-sha-256`, `scram-sha-512`), `KAFKA_SASL_USERNAME`, and
`KAFKA_SASL_PASSWORD`. The current integration factory and readiness script use broker addresses
without applying TLS/SASL settings. Adapt their client creation before using a secured broker.
Likewise, changing `API_BASE_URL` alone does not redirect the self-hosted API examples to a real service.

## Project layout

| Location                                                                                                                               | Responsibility                                                               |
| -------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `app/src/clients/api`                                                                                                                  | Reusable Playwright API request client                                       |
| `app/src/clients/db`, `app/src/db`                                                                                                     | PostgreSQL pooling, queries, transactions, targeted cleanup                  |
| `app/src/kafka`                                                                                                                        | JSON producer/consumer, connection configuration, event envelopes            |
| `app/src/schemas`                                                                                                                      | AJV validator and API/Kafka JSON schemas                                     |
| `app/src/config`, `app/src/logging`, `app/src/utils`                                                                                   | Environment validation, Pino logging, correlation IDs, polling               |
| `tests/src/rest-functional`, `kafka`, `e2e`, `contracts`, `negative`, `retry-idempotency`, `smoke-performance`, `consumer-lag-timeout` | Test groups                                                                  |
| `tests/src/assertions`                                                                                                                 | API, Kafka, database, and schema assertions                                  |
| `tests/src/builders`, `tests/src/fixtures`                                                                                             | Fluent builders, JSON fixtures, builder tests                                |
| `tests/src/db`                                                                                                                         | Transaction/cleanup helper tests                                             |
| `tests/src/mocks/wiremock`                                                                                                             | WireMock admin client and integration scenarios                              |
| `tests/src/reporting`, `tests/src/utils`                                                                                               | Attachments, Faker, test isolation, self-hosted order API, integration setup |
| `docker`, `docker-compose.yml`                                                                                                         | Service definitions, PostgreSQL initialization, WireMock mappings/body files |
| `scripts/wait-for-services.mjs`                                                                                                        | Dependency readiness checks                                                  |
| `docs`                                                                                                                                 | Architecture, conventions, strategy, decisions, and implementation plans     |
| `.github/workflows/ci.yml`, `.gitlab-ci.yml`                                                                                           | CI quality checks, test matrices, and reports                                |
| `artifacts`, `test-results`                                                                                                            | Ignored generated reports, attachments, and execution output                 |

### Adding scenarios

1. Add reusable clients or helpers under `app/src`, and schemas under `app/src/schemas`.
2. Add static fixtures under `tests/src/fixtures` and dynamic builders under `tests/src/builders`.
   Seed Faker for reproducible values; generate unique IDs/markers for shared-service data.
3. Add a `*.spec.ts` file to the relevant test group. Keep assertions and test-only support under
   `tests/src`.
4. Use explicit polling deadlines for eventual consistency, correlated Kafka filters, and targeted
   database cleanup. A `KafkaJsonConsumer` supports one wait per instance and generates a consumer
   group by default; disconnect it in teardown.
5. Attach useful API, Kafka, database, schema-input, or execution metadata using
   [reporting helpers](tests/src/reporting/attachments.ts).
6. Run the relevant group and quality checks, then the baseline suite before merging.

WireMock static mappings and response files belong in `docker/wiremock/mappings` and
`docker/wiremock/__files`. Its integration suite resets mappings to committed defaults before and
after each test.

## Reports and diagnostics

Every test run produces Playwright HTML and Allure results. Representative API, Kafka, and E2E
scenarios add JSON attachments for requests/responses, consumed messages, database results, schema
inputs, and execution metadata where applicable. Pino logs go to standard output.

| Output                                             | Location                   |
| -------------------------------------------------- | -------------------------- |
| Playwright HTML                                    | `artifacts/html-report`    |
| Allure raw results and attachments                 | `artifacts/allure-results` |
| Generated Allure HTML                              | `artifacts/allure-report`  |
| Playwright test output and retained failure traces | `test-results`             |

View the latest Playwright report:

```bash
npm run report
```

With Java available, generate and open Allure HTML:

```bash
npm run report:allure
npx allure open artifacts/allure-report
```

Regenerate Allure HTML after test execution. Raw Allure results can accumulate across local runs;
clear `artifacts/allure-results` before a run when you need a report containing only that run.

## CI/CD

[GitHub Actions](.github/workflows/ci.yml) runs on pushes to `main`, pull requests, and manual
`workflow_dispatch`. Manual runs accept a `test_group` choice (`all` or one of the nine groups).
[GitLab CI](.gitlab-ci.yml) uses `quality`, `test`, and `report` stages and always runs the nine-group
matrix; its runner must support Docker-in-Docker.

Both pipelines install with `npm ci`, check formatting/lint/types, start Compose in each test job,
wait for services, and enable the relevant opt-in flag. They generate per-group Allure HTML and retain
Playwright HTML, Allure results/HTML, test output, and Docker logs for 14 days. A final job generates
an aggregated Allure report. Test jobs capture diagnostics and stop services even after failures.

The group matrices omit the builder and DB helper suites included by `npm test`; run the baseline
suite locally to cover those files.

## Troubleshooting

| Symptom                                                     | Resolution                                                                                                        |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Integration tests are skipped                               | Set the appropriate opt-in flag to `true` in the same shell as the test command.                                  |
| `services:wait` fails                                       | Check `docker compose ps` and `docker compose logs --no-color`; confirm ports 9092, 5432, and 8080 are available. |
| Tests ignore customized `.env` values                       | Preload `dotenv/config` as shown above; inspect existing shell variables that override `.env`.                    |
| Changing `API_BASE_URL` has no effect on example HTTP tests | The examples create their own server; adapt the request context to the target service.                            |
| WireMock state is left over after an interrupted run        | Rerun the suite to reset mappings, or restart the service.                                                        |
| Allure generation fails or the report is empty              | Confirm `java -version` works, run tests, and inspect `artifacts/allure-results` before generating HTML.          |
| PowerShell blocks `npm` or `npx`                            | Use `npm.cmd` or `npx.cmd`.                                                                                       |

## Further reading

- [Architecture](docs/architecture.md)
- [Conventions](docs/conventions.md)
- [Testing strategy](docs/testing-strategy.md)
- [Decision register](docs/decision-register.md)
- [Implementation checklist and deferred work](TODO.md)

Planning documents and checklist entries describe intended scope as well as completed work; use the
source, npm scripts, and CI definitions to confirm current behavior.
