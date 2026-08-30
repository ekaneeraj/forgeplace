# ForgePlace API

ForgePlace is a wallet-first, social NFT marketplace. This repository is the backend **API** service — it handles authentication (wallet signature), user profiles, and will host the marketplace routes (minting, listings, collect, feed).

## Stack

- [NestJS](https://nestjs.com) 12 (TypeScript, strict mode, ESM)
- [TypeORM](https://typeorm.io) + PostgreSQL
- [viem](https://viem.sh) — EIP-191 wallet signing / signature recovery
- [passport-jwt](https://www.passportjs.org) — Bearer-token auth
- [class-validator](https://github.com/typestack/class-validator) / [class-transformer](https://github.com/typestack/class-transformer) — DTOs & serialization
- [Swagger](https://swagger.io) (`/chamber-of-secrets`) — interactive docs
- [vitest](https://vitest.dev) — unit + e2e tests
- [oxlint](https://oxc.rs/docs/guide/usage/linter.html) — linting
- [bun](https://bun.sh) — package manager & runtime

## Project structure

```
src/
├── main.ts                       # bootstrap: pipes, cors, swagger, port
├── app.module.ts                 # root composition + global providers
├── app.controller.ts/.service.ts # home status UI (GET /)
├── common/
│   ├── dto/api-response.dto.ts   # unified response envelope
│   └── filters/…                 # global AllExceptionsFilter
├── database/                     # TypeORM postgres config
├── auth/                         # wallet sign/login + jwt strategy + guard
└── user/                         # user entity, DTOs, service, controller
test/app.e2e-spec.ts              # e2e suite (no live DB required)
```

> Architecture & convention guide lives at `../ARCHITECTURE.md` (repo root, outside this service).

## Getting started

### Quick start (clone → run)

```bash
# 1. Clone (the monorepo — contains api/, ui/, docker-compose.yml)
git clone <repo-url> forgeplace
cd forgeplace/api

# 2. Install dependencies
bun install

# 3. Start Postgres (dev stack from the monorepo root, exposed on :2345)
cd .. && docker compose up -d postgres
cd api

# 4. Configure the app
cp .env.example .env
# edit .env → set DATABASE_URL, JWT_SECRET, JWT_EXPIRATION_SECONDS
#   DATABASE_URL=postgres://<user>:<password>@localhost:2345/test_db

# 5. Run (watch mode)
bun run start:dev

# 6. Open
#   Home   → http://localhost:4242
#   Swagger → http://localhost:4242/chamber-of-secrets
```

To run the whole API as a container instead of via bun: see [Docker](#docker).

### Prerequisites

**Required**
- [bun](https://bun.sh) 1.x — package manager **and** runtime. All scripts (`bun run build/test/...`) run through bun's Node-compatible runtime, so **Node.js is not required** separately (and no `nvm`/`.nvmrc` needed). Production runs on `oven/bun` via Docker.
- A PostgreSQL instance — spin up the compose stack at the monorepo root (`docker compose up -d postgres`, exposed on `:2345`), or use any reachable Postgres via `DATABASE_URL` (see [Docker](#docker)).

**Optional**
- **Node.js / nvm** — only if you want to run the compiled output with plain Node instead of bun (`node dist/main.js`) or use Node-based tooling.
- **A wallet / private key** — to exercise `/auth/sign` and `/auth/login` (any EIP-191-capable key works; e.g. the Hardhat test key `0xac09…ff80` → `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`).

### Setup

```bash
bun install
```

Create `.env` (copy from `.env.example`) at the repo root — the Joi schema makes these keys **required** (boot fails fast if missing):

```env
PORT=4242
DATABASE_URL=postgres://<user>:<password>@localhost:2345/test_db
JWT_SECRET=<change-me>
JWT_EXPIRATION_SECONDS=1800
```

> Note: if you used a Postgres other than the compose stack, adjust `DATABASE_URL` accordingly (any reachable instance works).

| Variable                | Required | Default | Purpose                                        |
| ----------------------- | -------- | ------- | ---------------------------------------------- |
| `DATABASE_URL`          | yes      | –       | Postgres connection string for TypeORM         |
| `JWT_SECRET`            | yes      | –       | HS256 signing secret for access tokens         |
| `JWT_EXPIRATION_SECONDS`| yes      | –       | Access-token lifetime (e.g. `1800` = 30 min)   |
| `PORT`                  | no       | `3000`  | HTTP listen port (Docker image sets `4242`)    |

### Run

```bash
bun run start         # build & serve via nest start
bun run start:dev     # watch mode (dev)
bun run start:prod    # node dist/main (compiled output)
bun run build         # compile to dist/
```

Server listens on `process.env.PORT || 3000` (the `.env.example` sets `PORT=4242`).

### Docs & home

- `GET /` — branded status page with a link to the docs
- `GET /chamber-of-secrets` — interactive Swagger UI (including the OpenAPI JSON at `/chamber-of-secrets-json`)

## API overview

All responses use a uniform envelope (`ApiResponseDto`): `{ statusCode, success, message, data, timestamp, path }`.

| Method | Path           | Auth   | Description                                  |
| ------ | -------------- | ------ | -------------------------------------------- |
| POST   | `/auth/sign`   | –      | Sign the ForgePlace message with a wallet key → `{ signature, timestamp, walletAddress }` |
| POST   | `/auth/login`  | –      | Verify signature, find-or-create user → `{ accessToken, user (incl. role), timestamp }` |
| GET    | `/users/me`    | Bearer | Current user including `role`                |
| GET    | `/users`       | –      | List users (`role` withheld)                 |
| GET    | `/users/:id`   | –      | User by id (`role` withheld)                 |
| PATCH  | `/users/:id`   | –      | Update a user                                |

The `role` field is exposed only on the self-facing routes (`/users/me`, `/auth/login`) via class-transformer `@Expose` groups.

## Tests

```bash
bun run test          # unit tests (vitest, *.spec.ts)
bun run test:e2e      # e2e tests (*.e2e-spec.ts) — runs without a live DB
bun run test:cov      # coverage
bun run lint          # oxlint src/ test/
```

## Docker

### 1. Database via docker-compose (dev stack)

The monorepo root ships a `docker-compose.yml` (service name `dev-stack`) with Postgres + pgAdmin. Start it, then point `DATABASE_URL` at it:

```bash
cd ..                      # monorepo root
docker compose up -d postgres
```

The dev Postgres is exposed at **`localhost:2345`**, so your `.env` becomes:

```env
DATABASE_URL=postgres://<user>:<password>@localhost:2345/test_db
```

pgAdmin (optional) runs at `http://localhost:5050`.

### 2. Build & run the API image

Build the image, then run it with config injected at runtime (secrets are never baked into the image):

```bash
docker build -t forgeplace-api .
docker run -p 4242:4242 --env-file .env forgeplace-api
```

- The container listens on **port `4242`** (the Dockerfile sets `ENV PORT=4242` and `EXPOSE 4242`), so map `-p 4242:4242` and open `http://localhost:4242` (home UI) / `/chamber-of-secrets` (Swagger).
- `--env-file .env` passes `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRATION_SECONDS`, `PORT` — make sure they're set in the file, otherwise the app fails fast on the Joi validation.
- One-liner against Docker networking: `docker network ls` → run with `--network <stack-network>` if you want the API to reach the compose Postgres by container name instead of `localhost`.

### Build context (.dockerignore)

`node_modules`, `dist`, `.git`, `.env*`, coverage, tests and docs are excluded from the image (dependencies are installed inside the container via `bun install --frozen-lockfile`).

## Scripts

```bash
bun run build      # nest build
bun run start      # nest start
bun run start:dev  # watch mode
bun run start:prod # node dist/main
bun run test       # unit tests
bun run test:e2e   # e2e tests
bun run lint       # oxlint
```