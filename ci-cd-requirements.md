CI/CD requirements:

Generate CI pipelines for:

1. GitHub Actions
2. GitLab CI

Pipeline stages:

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

1. Start Docker Compose services.
2. Wait for Kafka readiness.
3. Wait for WireMock readiness.
4. Run test suites independently.
5. Publish Allure artifacts.
6. Publish HTML report artifacts.
7. Publish logs.
8. Fail pipeline on test failures.
9. Support environment variables for different environments.
10. Allow execution of specific test groups via pipeline variables.

Example execution matrix:

Smoke Tests
REST Functional Tests
Kafka Tests
Contract Tests
E2E Tests

should be runnable independently.