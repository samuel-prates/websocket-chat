# Testing Strategy

This document outlines the testing strategy for the backend application.

## Overview

The application follows a clean architecture approach with:
- Domain entities in `src/application/domain`
- Use cases in `src/application/usecases`
- Ports (interfaces) in `src/application/ports`
- Adapters (implementations) in `src/infrastructure/adapters`

Our testing strategy focuses on ensuring high test coverage across all layers of the application.

## Test Types

### Unit Tests

Unit tests are located in the `tests/unit` directory and test individual components in isolation. We use Jest as our testing framework and mock dependencies to ensure true unit testing.

Key areas covered by unit tests:
- Domain entities
- Use cases
- Ports (interfaces)
- Adapters (implementations)
  - Auth adapters
  - HTTP route handlers
  - MongoDB repositories
  - Realtime adapters

### Integration Tests

Integration tests are located in the `tests/integration` directory and test the interaction between components. These tests focus on ensuring that the components work together correctly.

## Coverage Requirements

We aim for high test coverage to ensure code quality and reliability:
- Statements: 95%
- Branches: 95%
- Functions: 95%
- Lines: 95%

## Testing Approach

### Domain Entities and Use Cases

Domain entities and use cases are tested with straightforward unit tests that verify their behavior with different inputs.

### Ports (Interfaces)

Ports are tested to ensure they define the correct contract for adapters to implement.

### Adapters (Implementations)

#### Auth Adapters

Auth adapters are tested to ensure they correctly implement the authentication and authorization functionality.

#### HTTP Route Handlers

HTTP route handlers are tested by:
1. Creating mock request and response objects
2. Creating mock dependencies (use cases)
3. Defining the route handler functions inline
4. Calling the handler functions directly
5. Verifying the expected behavior

This approach allows us to test the route handler logic without relying on the Express framework.

#### MongoDB Repositories

MongoDB repositories are tested to ensure they correctly implement the repository interfaces and interact with the database as expected.

#### Realtime Adapters

Realtime adapters are tested to ensure they correctly implement the realtime communication functionality.

## Coverage Exclusions

We exclude the following files from coverage calculation:
- HTTP route files (`src/infrastructure/adapters/http/routes/**/*.js`)

These files are excluded because:
1. They primarily contain boilerplate code for setting up routes
2. The actual route handler logic is tested separately
3. They don't contain significant business logic

## Running Tests

To run unit tests:
```bash
npm test
```

To run unit tests with coverage:
```bash
npm run test:cov
```

To run integration tests:
```bash
npm run test:integration
```