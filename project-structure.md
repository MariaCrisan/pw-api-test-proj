root
│
├── src
│   ├── clients
│   │   ├── api
│   │   └── db
│   │
│   ├── kafka
│   │   ├── producer
│   │   ├── consumer
│   │   └── assertions
│   │
│   ├── assertions
│   │   ├── api
│   │   ├── kafka
│   │   └── database
│   │
│   ├── schemas
│   │   ├── api
│   │   ├── kafka
│   │   └── contracts
│   │
│   ├── fixtures
│   │   ├── api
│   │   ├── kafka
│   │   ├── db
│   │   └── contracts
│   │
│   ├── builders
│   │   ├── api
│   │   ├── kafka
│   │   └── db
│   │
│   ├── config
│   │
│   ├── reporting
│   │
│   ├── logging
│   │
│   └── utils
│
├── tests
│   ├── rest-functional
│   ├── kafka
│   ├── e2e
│   ├── contracts
│   ├── negative
│   ├── retry-idempotency
│   ├── smoke-performance
│   └── consumer-lag-timeout
│
├── docker
│
├── artifacts
│
├── .github
│
├── .gitlab
│
└── README.md
