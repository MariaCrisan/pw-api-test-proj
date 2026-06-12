Reporting requirements:

1. Allure Reporting
   - Generate Allure results for every test execution.
   - Include test steps.
   - Include request/response payload attachments.
   - Include Kafka message payload attachments.
   - Include screenshots only when applicable.
   - Include environment information.
   - Support historical trend reporting.

2. HTML Reporting
   - Generate Playwright HTML reports.
   - Include execution summary.
   - Include passed, failed, skipped statistics.
   - Include execution duration.
   - Include links to attached logs and artifacts.

3. Logging
   - Capture API requests and responses.
   - Capture Kafka producer events.
   - Capture Kafka consumer events.
   - Capture DB validation results.
   - Store logs as CI artifacts.

4. Failure Diagnostics
   - Attach API request payload.
   - Attach API response payload.
   - Attach Kafka message payload.
   - Attach schema validation errors.
   - Attach assertion failure details.
   - Provide clear timeout diagnostics for asynchronous tests.

Artifact structure:

artifacts/
  logs/
  allure-results/
  allure-report/
  html-report/
  requests/
  responses/
  kafka/