root
│
├── app
│   └── src
│       ├── clients
│       │   ├── api
│       │   └── db
│       │
│       ├── db
│       │   ├── queries
│       │   └── transactions
│       │
│       ├── kafka
│       │   ├── producer
│       │   └── consumer
│       │
│       ├── schemas
│       │   ├── api
│       │   ├── kafka
│       │   └── contracts
│       │
│       ├── config
│       │
│       ├── logging
│       │
│       └── utils
│
├── tests
│   └── src
│       ├── rest-functional
│       ├── kafka
│       ├── e2e
│       ├── contracts
│       ├── negative
│       ├── retry-idempotency
│       ├── smoke-performance
│       ├── consumer-lag-timeout
│       │
│       ├── assertions
│       │   ├── api
│       │   ├── kafka
│       │   └── database
│       │
│       ├── fixtures
│       │   ├── api
│       │   ├── kafka
│       │   ├── db
│       │   └── contracts
│       │
│       ├── builders
│       │   ├── api
│       │   ├── kafka
│       │   └── db
│       │
│       ├── mocks
│       │   └── wiremock
│       │
│       ├── reporting
│       │
│       ├── config
│       │
│       └── utils
│
├── docker
│   ├── kafka
│   ├── postgres
│   └── wiremock
│       ├── mappings
│       └── __files
│
├── artifacts
│   ├── logs
│   ├── allure-results
│   ├── allure-report
│   ├── html-report
│   ├── requests
│   ├── responses
│   └── kafka
│
├── .github
│   └── workflows
│
├── .gitlab
│
├── .env.example
├── docker-compose.yml
├── package.json
├── playwright.config.ts
├── tsconfig.json
└── README.md
