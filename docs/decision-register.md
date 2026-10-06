# Decision Register

## Phase 8 scope review

The Phase 8 hardening pass does not add a custom DSL, generator, plugin system, multi-database
support, Kubernetes deployment, k6/Gatling, or AI-generated tests. The representative scenarios do
not yet demonstrate recurring test authoring that would justify those abstractions. The items remain
deferred until real project usage establishes a concrete need.

| Decision               | Chosen approach                                                                                                   | Status                         |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| Node.js and npm        | Node.js 20+ and npm 10+, enforced in `package.json`.                                                              | Decided                        |
| Local Kafka            | One KRaft broker in Docker Compose.                                                                               | Decided                        |
| Kafka serialization    | JSON messages with an envelope containing event ID, event type, timestamp, correlation ID, version, and payload.  | Decided                        |
| Schema Registry        | Not used initially; reconsider for Avro/Protobuf requirements.                                                    | Decided                        |
| Kafka topics           | Provision explicitly through integration-test admin setup; do not rely on automatic topic creation.               | Implemented for local examples |
| Kafka consumption      | Generate a consumer group per wait, read retained messages, and filter by correlation ID or key.                  | Decided                        |
| Database bootstrap     | Docker initialization SQL creates only framework-owned local objects.                                             | Decided                        |
| Database cleanup       | Use test-run markers and targeted transactional cleanup; never truncate shared tables.                            | Decided for implementation     |
| Environments           | `local`, `dev`, and `stage`; local defaults only, secret values from environment/CI.                              | Decided                        |
| Reports                | Playwright HTML first; Allure attachments in the reporting phase.                                                 | Decided                        |
| CI                     | GitHub Actions first, then GitLab CI.                                                                             | Decided                        |
| Sample domain contract | Framework-owned order API, integration topic, and `orders` table; replace with the target service contract later. | Implemented as a local example |

## Phase 0 acceptance criteria

- `npm install` succeeds from a clean checkout.
- `npm run format:check`, `npm run lint`, `npm run typecheck`, and `npm test` pass.
- `npm run services:up` followed by `npm run services:wait` verifies all local dependencies.
- The next integration milestone is one reliable API to Kafka to PostgreSQL scenario using a confirmed business contract.
