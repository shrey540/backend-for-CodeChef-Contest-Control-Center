# CodeChef Contest Control Center — Backend

> A production-quality backend system for managing competitive programming contests, built with NestJS, Prisma ORM, PostgreSQL, and JWT-based Role-Based Access Control.

---

## Project Overview

The **CodeChef Contest Control Center** is a backend REST API that replicates the core contest management infrastructure of platforms like CodeChef. It exposes endpoints for managing contests, problems, participant registrations, code submissions, dynamic leaderboards, freeze mode, submission rejudging, and a full domain audit trail.

The system is designed as a **modular monolith** — each business domain is encapsulated in its own NestJS module with clearly defined public interfaces, making it easy to reason about, test independently, and eventually extract into microservices. The API is fully documented via Swagger/OpenAPI and secured with stateless JWT authentication and fine-grained RBAC.

---

## Architecture Overview

```
                     HTTP Request
                          |
               +----------v----------+
               |     NestJS Guards   |
               |  JwtAuthGuard       |
               |  RolesGuard         |
               +----------+---------+
                          |
               +----------v----------+
               |     Controllers     |
               |  (Routing + DTOs)   |
               +----------+---------+
                          |
               +----------v----------+
               |      Services       |
               |  (Business Logic)   |
               +----------+---------+
                          |
               +----------v----------+
               |    Prisma ORM       |
               |  (Type-safe client) |
               +----------+---------+
                          |
               +----------v----------+
               |     PostgreSQL      |
               |  (Persistence)      |
               +---------------------+
```

**Key architectural layers:**

- **Controllers** — Handle HTTP routing, parameter extraction, and DTO binding. Zero business logic lives here.
- **Services** — Own all business rules, ownership assertions, and database queries. Injected via NestJS DI.
- **Prisma ORM** — Fully type-safe database client generated from `schema.prisma`. All queries compile-time checked.
- **PostgreSQL** — Enforces relational integrity (FK constraints, unique indexes) as a second safety net.
- **Authentication layer** — `passport-jwt` validates Bearer tokens on every protected route. Decoded payload becomes `AuthenticatedUser` on the request context.
- **RBAC** — `RolesGuard` + `@Roles()` for coarse-grained role checks at the controller level. Service-level `assert*()` methods handle fine-grained ownership (e.g. organizer can only manage their own contests).
- **Module-based architecture** — Each NestJS module owns exactly one domain with explicit imports/exports. Domain boundaries mirror future microservice extraction points.

---

## Features

- [x] JWT login and stateless authentication
- [x] Role-based access control (ADMIN, ORGANIZER, PARTICIPANT)
- [x] Contest lifecycle — DRAFT to LIVE to ENDED (strict one-way transitions)
- [x] Problem CRUD with duplicate code/title prevention per contest
- [x] Participant self-registration with status-window enforcement
- [x] Code submissions with language selection (CPP, JAVA, PYTHON, JAVASCRIPT)
- [x] Paginated and filterable submission listing
- [x] Dynamic ICPC-style leaderboard computed on-demand (no persisted rank table)
- [x] Leaderboard freeze mode — participants see snapshot, admin/organizer see live data
- [x] Submission rejudging with atomic verdict update and RejudgeHistory audit record
- [x] Append-only activity log covering all domain events
- [x] Activity log filtering by action type and date range with pagination
- [x] Full Swagger/OpenAPI documentation at /api/docs
- [x] Global ValidationPipe with whitelist and forbidNonWhitelisted
- [x] bcrypt password hashing
- [x] Idempotent database seeder with three pre-configured users

---

## Tech Stack

| Category | Technology | Version |
|---|---|---|
| Runtime | Node.js | >= 20 LTS |
| Framework | NestJS | ^10.4 |
| Language | TypeScript | ^5.7 |
| ORM | Prisma | ^6.1 |
| Database | PostgreSQL | >= 15 |
| Authentication | Passport + passport-jwt | ^0.7 / ^4.0 |
| Token signing | @nestjs/jwt | ^10.2 |
| Password hashing | bcrypt | ^5.1 |
| Validation | class-validator + class-transformer | ^0.14 / ^0.5 |
| API Documentation | @nestjs/swagger (OpenAPI 3) | ^8.1 |
| Configuration | @nestjs/config | ^3.3 |

---

## Project Structure

```
codechef-ccc/
|-- prisma/
|   |-- schema.prisma          # Full domain schema (models and enums)
|   `-- seed.ts                # Idempotent seeder (admin, organizer, participant)
|
|-- src/
|   |-- main.ts                # Bootstrap: global prefix, ValidationPipe, Swagger
|   |-- app.module.ts          # Root module — imports all feature modules
|   |
|   |-- auth/                  # Authentication module (global exports)
|   |   |-- decorators/        # @CurrentUser(), @Roles()
|   |   |-- dto/               # LoginDto, LoginResponseDto, UserResponseDto
|   |   |-- guards/            # JwtAuthGuard, RolesGuard
|   |   |-- interfaces/        # AuthenticatedUser interface
|   |   |-- strategy/          # JwtStrategy (passport-jwt)
|   |   |-- auth.controller.ts
|   |   |-- auth.service.ts
|   |   `-- auth.module.ts
|   |
|   |-- config/                # ConfigModule — env variable schema
|   |-- prisma/                # Global PrismaService (extends PrismaClient)
|   |-- common/
|   |   `-- enums/             # ActivityAction enum
|   |
|   `-- modules/
|       |-- contest/           # Contest CRUD + lifecycle state machine
|       |   |-- constants/     # PARTICIPANT_VISIBLE_STATUSES
|       |   |-- dto/           # CreateContestDto, UpdateContestDto, ContestResponseDto
|       |   |-- utils/         # Schedule validation helper
|       |   |-- contest.controller.ts
|       |   |-- contest.service.ts
|       |   `-- contest.module.ts
|       |
|       |-- problem/           # Problems nested under contests
|       |   |-- dto/           # CreateProblemDto, UpdateProblemDto, ProblemResponseDto
|       |   |-- problem.controller.ts
|       |   |-- problem.service.ts
|       |   `-- problem.module.ts
|       |
|       |-- registration/      # Participant enrollment
|       |   |-- dto/           # RegistrationResponseDto
|       |   |-- registration.controller.ts
|       |   |-- registration.service.ts
|       |   `-- registration.module.ts
|       |
|       |-- submission/        # Submissions + pagination + filtering
|       |   |-- dto/           # CreateSubmissionDto, SubmissionResponseDto, SubmissionListQueryDto
|       |   |-- submission.controller.ts
|       |   |-- submission.service.ts
|       |   `-- submission.module.ts
|       |
|       |-- leaderboard/       # Dynamic ICPC-style ranking
|       |   |-- dto/           # LeaderboardEntryDto, LeaderboardResponseDto, ParticipantRankDto
|       |   |-- leaderboard.controller.ts
|       |   |-- leaderboard.service.ts
|       |   `-- leaderboard.module.ts
|       |
|       |-- freeze/            # Leaderboard freeze toggle
|       |   |-- freeze.controller.ts
|       |   |-- freeze.service.ts
|       |   `-- freeze.module.ts
|       |
|       |-- rejudge/           # Re-evaluation with atomic audit record
|       |   |-- dto/           # RejudgeHistoryResponseDto
|       |   |-- rejudge.controller.ts
|       |   |-- rejudge.service.ts
|       |   `-- rejudge.module.ts
|       |
|       `-- activity/          # Append-only domain audit log (global module)
|           |-- dto/           # ActivityLogResponseDto, ActivityLogListQueryDto
|           |-- activity.controller.ts
|           |-- activity.service.ts
|           `-- activity.module.ts
|
|-- .env.example
|-- package.json
|-- tsconfig.json
`-- tsconfig.build.json
```

---

## Database Design

All tables use **UUID primary keys** generated by PostgreSQL and `TIMESTAMPTZ` timestamps.

| Entity | Key Fields | Notes |
|---|---|---|
| **User** | id, email, name, passwordHash, role | Roles: ADMIN, ORGANIZER, PARTICIPANT. Email is unique. |
| **Contest** | id, organizerId, name, description, status, startTime, endTime, freezeEnabled, freezeAt | Status: DRAFT, SCHEDULED, LIVE, ENDED. FK to User. |
| **Problem** | id, contestId, code, title, statement, difficulty, points, timeLimitMs, memoryLimitMb | code is unique within a contest. FK to Contest (cascade delete). |
| **Registration** | id, contestId, userId, registeredAt | Unique (contestId, userId). FK to Contest and User. |
| **Submission** | id, contestId, problemId, userId, language, code, verdict, submittedAt, judgedAt | Initial verdict: PENDING. Languages: CPP, JAVA, PYTHON, JAVASCRIPT. |
| **RejudgeHistory** | id, submissionId, rejudgedById, oldVerdict, newVerdict, rejudgedAt | Append-only — records are never mutated or deleted. |
| **ActivityLog** | id, action, contestId, actorId, entityType, entityId, metadata, createdAt | Append-only. JSONB metadata for flexible event context. |

---

## API Modules

| Module | Major Endpoints | Purpose |
|---|---|---|
| **Auth** | POST /auth/login, GET /auth/me | Obtain JWT token and retrieve own user profile |
| **Contest** | POST /contests, GET /contests, GET /contests/:id, PATCH /contests/:id, DELETE /contests/:id, POST /contests/:id/start, POST /contests/:id/end | Full contest lifecycle management |
| **Problem** | POST /contests/:cId/problems, GET /contests/:cId/problems, GET .../problems/:id, PATCH .../problems/:id, DELETE .../problems/:id | Problem CRUD nested under a contest |
| **Registration** | POST /contests/:cId/registrations, GET .../registrations, GET .../registrations/:pId | Participant self-registration and admin lookup |
| **Submission** | POST /contests/:cId/submissions, GET .../submissions, GET .../submissions/:id, GET .../participants/:pId/submissions, GET .../problems/:pId/submissions | Submit code, list and filter submissions with pagination |
| **Leaderboard** | GET /contests/:cId/leaderboard, GET /contests/:cId/leaderboard/rank/:pId | Dynamic ICPC leaderboard and single-participant rank lookup |
| **Freeze** | POST /contests/:cId/freeze/enable, POST /contests/:cId/freeze/disable | Toggle leaderboard visibility freeze for LIVE contests |
| **Rejudge** | POST /contests/:cId/submissions/:sId/rejudge | Re-evaluate a submission verdict and record audit history |
| **Activity Logs** | GET /contests/:cId/activity-logs, GET /contests/:cId/activity-logs/:id | Paginated, filterable domain event audit trail |

---

## Authentication Flow

```
Client
  |
  +-- POST /api/v1/auth/login { email, password }
  |        |
  |        v
  |   AuthService.login()
  |     - Find user by email (Prisma)
  |     - bcrypt.compare(password, hash)
  |     - JwtService.sign({ sub, email, role })
  |     - Return { accessToken, user }
  |
  +-- Any protected route  [Authorization: Bearer <token>]
           |
           v
      JwtAuthGuard (passport-jwt)
        - Extract and verify JWT
        - Decode payload -> AuthenticatedUser
        - Attach to request context
           |
           v
      RolesGuard (when @Roles() is present)
        - Compare user.role against allowed roles
        - Throw 403 if not permitted
           |
           v
      Controller -> @CurrentUser() -> Service
        - Service performs ownership assertions
          (assertCanManage, assertCanViewRegistrations, etc.)
           |
           v
      PrismaService -> PostgreSQL
           |
           v
      JSON Response
```

---

## Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd backend-for-CodeChef-Contest-Control-Center

# 2. Install all dependencies
npm install
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/codechef_ccc?schema=public"
JWT_SECRET="your-long-random-secret-key"
JWT_EXPIRES_IN="24h"
PORT=3000
```

| Variable | Required | Description |
|---|---|---|
| DATABASE_URL | Yes | PostgreSQL connection string |
| JWT_SECRET | Yes | Secret key used to sign JWT tokens |
| JWT_EXPIRES_IN | No (default: 24h) | Token lifetime (e.g. 1h, 7d, 24h) |
| PORT | No (default: 3000) | HTTP server port |

---

## Database Setup

```bash
# Generate the Prisma client from schema.prisma
npx prisma generate

# Apply all migrations to the database
npx prisma migrate dev --name init

# Seed initial users (admin, organizer, participant)
npx prisma db seed
```

**Seeded credentials:**

| Role | Email | Password |
|---|---|---|
| ADMIN | admin@codechef.local | Password123! |
| ORGANIZER | organizer@codechef.local | Password123! |
| PARTICIPANT | participant@codechef.local | Password123! |

---

## Running the Project

```bash
npm run start:dev
```

The API server starts at: `http://localhost:3000`

All routes are prefixed with `/api/v1` — e.g. `http://localhost:3000/api/v1/auth/login`

---

## API Documentation

Interactive Swagger UI:

```
http://localhost:3000/api/docs
```

Usage:

1. Open the Swagger UI in a browser.
2. Call `POST /api/v1/auth/login` with seeded credentials to obtain a JWT.
3. Click **Authorize** (top right) and enter: `Bearer <your_token>`.
4. All protected endpoints are now unlocked for live testing.

---

## Build Commands

```bash
# Production TypeScript build
npm run build

# Run production build
npm run start:prod

# Lint with auto-fix
npm run lint

# Unit tests
npm test

# Tests with coverage report
npm run test:cov
```

---

## Assumptions and Design Decisions

| Decision | Rationale |
|---|---|
| **UUID primary keys** | Generated by PostgreSQL. Prevents ID enumeration, safe in public URLs, and portable across environments. |
| **PostgreSQL** | Chosen for strong relational integrity, native UUID and TIMESTAMPTZ support, and JSONB for activity log metadata. |
| **Stateless JWT** | No session store or Redis needed. The role is embedded in the token payload — every request is fully self-describing and horizontally scalable. |
| **RBAC via Guards and Decorators** | JwtAuthGuard validates identity. RolesGuard + @Roles() handles coarse-grained role enforcement. Service-level assert methods handle fine-grained ownership (e.g. organizer can only modify contests they own). |
| **Modular architecture** | Each NestJS module owns exactly one domain. Modules export only what other modules need. Domain boundaries mirror real microservice extraction points. |
| **Dynamic leaderboard** | No Leaderboard or Rank table. Rankings are computed on every GET /leaderboard request by aggregating Submission rows. This eliminates denormalization bugs and ensures correctness. Suitable for contest-scale workloads; Redis caching can be added when needed. |
| **ICPC penalty formula** | penalty = sum of (minutesFromStart(firstAC) + 20 * wrongAttemptsBefore) per solved problem. PENDING and RUNNING verdicts are excluded from wrong-attempt counts. |
| **Freeze mode** | When enabled, participants see submissions only up to freezeAt. ADMIN and the owning organizer always see live (unfrozen) data. Submissions continue accumulating during freeze. |
| **Atomic rejudge** | prisma.$transaction wraps the RejudgeHistory insert and Submission.verdict update atomically — preventing verdict/history drift under concurrent requests. |
| **Append-only activity log** | ActivityLog rows are never updated or deleted. ActivityService.log() is fire-and-forget and swallows its own errors so a logging failure never breaks a business flow. |
| **No sign-up endpoint** | Users are provisioned by an admin or via the seeder. This is intentional for the assignment scope — avoids implementing email verification and account management. |
| **Mock judge** | RejudgeService uses a deterministic mock (submission UUID modulo verdict array). In production this would be replaced by an async call to a sandboxed code-execution service. |

---

## Future Improvements

| Feature | Description |
|---|---|
| **Real judge service** | Replace the mock judge with an async sandboxed executor (Judge0, Piston, custom isolate) integrated via BullMQ or RabbitMQ. |
| **Docker support** | Add Dockerfile and docker-compose.yml to containerize the API + PostgreSQL for reproducible local and CI environments. |
| **Redis caching** | Cache leaderboard snapshots with short TTLs to avoid full recomputation on every request during peak contest traffic. |
| **WebSocket live leaderboard** | Push leaderboard deltas to connected clients via @nestjs/websockets (Socket.IO) eliminating client-side polling. |
| **Scheduled auto-start** | Use @nestjs/schedule to automatically transition SCHEDULED contests to LIVE at startTime via a cron job. |
| **Unit and E2E tests** | Jest unit tests for all services, Supertest E2E tests for all controller routes using an isolated test database. |
| **CI/CD pipeline** | GitHub Actions workflow: lint -> build -> test -> Docker build -> deploy on merge to main. |
| **Rate limiting** | @nestjs/throttler on login and submission endpoints to prevent brute-force and abuse. |
| **Refresh tokens** | Short-lived access tokens paired with long-lived refresh tokens (HTTP-only cookie or DB-backed). |
| **Containerized deployment** | Kubernetes manifests or managed PaaS deployment (Railway, Render, Fly.io) with secrets management. |

---

## Author

**Shreyash Kumar**

Built as a backend engineering assignment demonstrating NestJS modular monolith patterns, Prisma ORM, JWT-based RBAC, and production-quality RESTful API design for a competitive programming platform.
