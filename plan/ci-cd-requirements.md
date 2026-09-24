CI/CD requirements:

Generate CI pipelines for:

1. GitHub Actions
2. GitLab CI

Pipeline stages:

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

1. Start Docker Compose services.
2. Wait for Kafka readiness.
3. Wait for PostgreSQL readiness.
4. Wait for WireMock readiness.
5. Run test suites independently.
6. Publish Allure artifacts.
7. Publish HTML report artifacts.
8. Publish logs.
9. Fail pipeline on test failures.
10. Support environment variables for different environments.
11. Allow execution of specific test groups via pipeline variables.

Example execution matrix:

Smoke Tests
REST Functional Tests
Kafka Tests
Contract Tests
Negative Tests
Retry/Idempotency Tests
Smoke/Performance Tests
Consumer Lag/Timeout Tests
E2E Tests

should be runnable independently.
