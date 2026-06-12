Database Requirements:

1. PostgreSQL support via node-postgres (pg).
2. Reusable database client.
3. Database query helper layer.
4. Database assertion helper layer.
5. Support transactional test cleanup.
6. Support polling database assertions for eventual consistency.
7. Support validation of records created by Kafka consumers.
8. Support environment-specific connection configuration.
9. No hardcoded credentials.
10. Example API → Kafka → PostgreSQL validation test.