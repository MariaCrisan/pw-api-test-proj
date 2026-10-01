Database Requirements:

1. PostgreSQL support via node-postgres (pg).
2. Reusable database client under app/src/clients/db.
3. Database query helper layer under app/src/db/queries.
4. Transaction and cleanup helper layer under app/src/db/transactions.
5. Database assertion helper layer under tests/src/assertions/database.
6. DB fixtures and builders under tests/src/fixtures/db and tests/src/builders/db.
7. Support transactional test cleanup.
8. Support polling database assertions for eventual consistency.
9. Support validation of records created by Kafka consumers.
10. Support environment-specific connection configuration.
11. No hardcoded credentials.
12. Example API -> Kafka -> PostgreSQL validation test.
