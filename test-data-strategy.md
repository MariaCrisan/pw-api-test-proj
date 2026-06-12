Test Data Strategy:

Use a hybrid test data approach:

1. JSON fixtures
   - Store reusable static payloads in src/fixtures/.
   - Organize fixtures by domain and test type.
   - Example:
     src/fixtures/users/valid-user.json
     src/fixtures/users/invalid-user.json
     src/fixtures/orders/valid-order.json
     src/fixtures/kafka/order-created-event.json

2. Builder pattern
   - Store builders in src/builders/.
   - Builders should create valid default test objects.
   - Builders should allow field overrides.
   - Builders should support readable chaining.
   - Example:
     UserBuilder.create()
       .withEmail("test@example.com")
       .withCountry("RO")
       .build();

3. Faker
   - Use Faker to generate dynamic unique values.
   - Use Faker for emails, IDs, names, timestamps, addresses, and correlation IDs.
   - Generated data must be deterministic where required.
   - Support seeded Faker for repeatable tests.

Rules:
- Test files should not manually construct large payloads.
- Tests should use builders for dynamic data.
- Tests should use fixtures for reusable static scenarios.
- Builders may load base objects from JSON fixtures and override fields.
- Keep test data reusable across REST, Kafka, DB, and E2E tests.
- Avoid hardcoded magic values inside test files.