> What exactly will be tested, by whom, when, in which environment, and with what evidence?

## Typical test plan contents

### 1. Document information

* Project or release name
* Version
* Author and reviewers
* Date
* Document status
* Change history

### 2. Objectives

Describe what this testing cycle must prove.

Example:

> Verify that customers can request quotes, purchase policies, and submit claims without regression in existing functionality.

### 3. Scope

#### In scope

* Login
* Quote creation
* Policy purchase
* Claims submission
* REST API validation
* UI validation
* Database persistence

#### Out of scope

* Mobile application
* Production payment processing
* Full security penetration testing

### 4. Features to be tested

List the actual features included in this release.

| Feature           | Testing required                 |
| ----------------- | -------------------------------- |
| Login             | API, UI, negative, security      |
| Quote calculation | API, boundary, integration       |
| Policy purchase   | API, UI, database, end-to-end    |
| Claims            | API, UI, validation, persistence |

### 5. Test scenarios and test cases

Describe what will be tested.

Examples:

* Login with valid credentials.
* Login with an invalid password.
* Request a quote with valid customer data.
* Request a quote with missing mandatory fields.
* Purchase a policy using an expired quote.
* Submit a claim for an inactive policy.
* Verify the claim is persisted in the database.

The test plan may link to detailed test cases rather than containing every step directly.

### 6. Testing approach

Explain how testing will be executed:

* Manual testing
* API automation
* UI automation
* Exploratory testing
* Regression testing
* Database validation
* Integration testing
* Cross-browser testing

Example:

> API tests will validate business rules and persistence. UI tests will cover critical user journeys. Exploratory testing will focus on error handling and usability.

### 7. Test environment

Specify the exact environment:

* Environment name
* Application URL
* API URL
* Browser and version
* Operating system
* Database version
* External services
* Test accounts
* Required configuration

Example:

```text
Environment: QA
Browser: Chrome latest, Firefox latest, Edge latest
Database: PostgreSQL
API: https://qa-api.example.com
UI: https://qa.example.com
External services: Payment sandbox, email mock
```

### 8. Test data

Define:

* Required users and roles
* Valid and invalid data
* Boundary values
* Existing policies
* Claims in different statuses
* Database setup
* Data cleanup approach
* Whether production data is masked

### 9. Entry criteria

Testing can start when:

* Build is deployed.
* Requirements are approved.
* Test environment is available.
* Test data exists.
* APIs are accessible.
* No blocking environment defects exist.

### 10. Exit criteria

Testing can finish when:

* Planned tests are executed.
* Critical scenarios pass.
* No critical defects remain open.
* High-severity defects are fixed or accepted.
* Regression testing is complete.
* Test results are reported.
* Remaining risks are documented.

### 11. Roles and responsibilities

| Role                | Responsibility                                  |
| ------------------- | ----------------------------------------------- |
| QA Engineer         | Design and execute tests, report defects        |
| Automation Engineer | Maintain API and UI automation                  |
| Developer           | Fix defects and support technical investigation |
| Product Owner       | Clarify requirements and accept risks           |
| DevOps              | Maintain environments and pipelines             |
| Business Analyst    | Clarify business rules                          |

### 12. Schedule

Include dates or milestones:

* Test preparation
* Test data setup
* API testing
* UI testing
* Regression testing
* Defect retesting
* Final test report
* Release decision

### 13. Defect management

Define:

* Defect reporting tool
* Severity and priority
* Defect workflow
* Triage meetings
* Retesting process
* Rules for reopening defects

### 14. Risks and dependencies

| Risk                        | Impact                | Mitigation                 |
| --------------------------- | --------------------- | -------------------------- |
| QA environment unstable     | Testing delayed       | Environment health check   |
| Payment service unavailable | Purchase flow blocked | Use sandbox or mock        |
| Requirements change late    | Rework and regression | Impact analysis            |
| UI tests are flaky          | False failures        | Improve locators and waits |

### 15. Deliverables

Examples:

* Test cases
* Automated tests
* Test data
* Defect reports
* Execution results
* Screenshots and logs
* Traceability matrix
* Test summary report
* Release recommendation

### 16. Approvals

Identify who approves:

* Test plan
* Scope changes
* Accepted risks
* Final release recommendation

## Test strategy vs test plan

| Test strategy                   | Test plan                                            |
| ------------------------------- | ---------------------------------------------------- |
| High-level approach             | Detailed execution plan                              |
| Usually broader and more stable | Specific to a release or feature                     |
| Defines testing principles      | Defines exact scope, dates, people, and environments |
| May apply to multiple projects  | Usually applies to one testing cycle                 |
| Answers “How do we test?”       | Answers “What are we testing now?”                   |

A simple test plan structure is:

```text
1. Document information
2. Objectives
3. Scope
4. Features to be tested
5. Test scenarios
6. Test approach
7. Environment
8. Test data
9. Entry criteria
10. Exit criteria
11. Roles and responsibilities
12. Schedule
13. Defect management
14. Risks and dependencies
15. Deliverables
16. Approvals
```
