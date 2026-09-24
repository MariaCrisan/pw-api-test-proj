# End-to-end tests

Run with `npm run test:e2e` and set `RUN_INTEGRATION_TESTS=true` after starting Docker services.

E2E tests verify the API boundary, Kafka side effect, and database state together. Generated rows must be removed by test marker.
