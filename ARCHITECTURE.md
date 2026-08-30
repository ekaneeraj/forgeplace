# NestJS Project Boilerplate — Architecture & Conventions Guide

Reference implementation: `forgeplace/api` (NestJS 12). Copy this guide into any new **NestJS** service and follow it so every project keeps the same structure, contract, and tooling. Adjust the swagger path/title and env keys per project.

## How to use this guide (with an AI coding agent)

This file is written to be dropped into an agent's context to scaffold a new service from scratch. Instructions for the agent:

1. **Seed the baseline verbatim** — copy §2 (`package.json`, `tsconfig`, `vitest` configs, `Dockerfile`, `.dockerignore`, `docker-compose.yml`, `.env.example`, `main.ts`, `app.module.ts`, `common/`, `database/`) exactly as written. Only change the swagger title/path and env keys.
2. **Then build features** — for each feature use the structure and conventions in §3–§12: the file placement (§3), naming (§4), rule of repo-scoped absolute imports (§5), response envelope + exceptions (§6), field-hiding groups (§7). Treat the provided code blocks as the canonical shape.
3. **Do not invent** — no new libraries beyond §10 "Adding a package"; no `@Exclude`-based field stripping (§7 forbids it); no plain-JWT/`AuthGuard('jwt')` shortcuts (§9 mandates passport-jwt; any module hosting a guarded controller imports `PassportModule.register(...)`); `.js`-suffixed relative imports everywhere (§1).
4. **Finish with green gates** — run `bun run build && bun run lint && bun run test && bun run test:e2e` and fix until all pass. Run the e2e gate after any auth/router/serialization change.
5. **Docs stay in sync** — keep `README.md` (clone→run guide), `.env.example`, and endpoint tables current with whatever was scaffolded.

Any flag this guide explicitly marks **non-negotiable** (see §1, §7, §9) will be called out in review.

---

## 1. Project Foundation

- **ESM**: `"type": "module"` in `package.json`, `module: nodenext` (with `moduleResolution: nodenext`) in `tsconfig`. Consequences that are **non-negotiable**:
  - Every **relative import must end in `.js`** — even though the file is `.ts`. `import { UserService } from './user.service.js'`. Forgetting this breaks the built `dist/` at runtime.
  - Use **`import type { ... }`** for type-only imports so `isolatedModules` doesn't complain (e.g. `import type { Request } from 'express'`).
  - **CJS-style packages are imported as default exports**, NOT namespace imports — `import Joi from 'joi'`, never `import * as Joi from 'joi'`. This works because `allowSyntheticDefaultImports: true` + `esModuleInterop: true`.
- **Strict TypeScript**: `strict: true` in `tsconfig` (already set — do not loosen). This forbids `delete obj.field` (TS2790) — use `@Expose` groups (below) instead of mutating entities.
- **Validation & DTO transforms**: `class-validator` + `class-transformer`. Wire a global `ValidationPipe({ transform: true, whitelist: true })` in `main.ts` and in every e2e test.
- **Testing**: `vitest` (globals). Unit config includes `**/*.spec.ts`, e2e config includes `**/*.e2e-spec.ts`.
- **Linting**: `oxlint` runs over `src/` and `test/`.

---

## 2. Baseline Template (copy per project)

These files are identical boilerplate on every new NestJS service — copy them and adapt the swagger title/path and env keys.

### `.env` / `.env.example`
```env
PORT=4242
DATABASE_URL=postgres://user:pass@localhost:5432/<db>
JWT_SECRET=<change-me>
JWT_EXPIRATION_SECONDS=1800
```
- Commit `.env.example` (the skeleton); keep `.env` gitignored — the Joi schema (below) makes every listed key **required**, so boot fails fast if the real file is missing a value.
- `PORT` is optional in code (`process.env.PORT || 3000`); the example and Docker image standardize on `4242`.

### `Dockerfile`
```dockerfile
FROM oven/bun:1
WORKDIR /usr/src/app

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

ENV PORT=4242
EXPOSE 4242
CMD ["bun", "dist/main.js"]
```
- `bun` is the runtime (Node not required in the image). `--frozen-lockfile` pins versions → commit `bun.lock`.
- No secrets inside the image — inject via `--env-file .env` at run time.
- Run with `docker build -t <img> . && docker run -p 4242:4242 --env-file .env <img>`.

### `.dockerignore`
```dockerignore
node_modules
dist
.git
.env*
coverage
**/*.spec.ts
**/*.e2e-spec.ts
*.md
```
- `node_modules`/`dist` are rebuilt inside the image; `.env*` keeps secrets out (the image only needs `DATABASE_URL`, `JWT_SECRET`, etc. passed in at run time).

### `docker-compose.yml` (dev stack, monorepo root)
```yaml
name: dev-stack
services:
  postgres:
    container_name: pg_container
    image: postgres
    environment:
      POSTGRES_USER: <db-user>          # set a real dev user/password per project
      POSTGRES_PASSWORD: <db-password>  # must match DATABASE_URL
      POSTGRES_DB: test_db
    ports:
      - '2345:5432'               # host side is what DATABASE_URL uses → localhost:2345
    volumes:
      - postgres-data:/var/lib/postgresql
  pgadmin:
    container_name: pgadmin4_container
    image: dpage/pgadmin4
    environment:
      PGADMIN_DEFAULT_EMAIL: <admin-email>
      PGADMIN_DEFAULT_PASSWORD: <admin-password>
    ports:
      - '5050:80'
volumes:
  postgres-data:
```
- Start: `docker compose up -d postgres` → `DATABASE_URL=postgres://<db-user>:<db-password>@localhost:2345/test_db`.
- pgAdmin (optional) at `http://localhost:5050`.
- The compose file lives at the **monorepo root** (shared by all services); DB host map is `2345:5432`, so the *host* port is `2345`.

### `package.json` baseline (ESM)
```jsonc
{
  "name": "<service>",
  "private": true,
  "type": "module",                    // ESM — this is why imports need the .js suffix
  "scripts": {
    "build": "nest build",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:prod": "node dist/main",
    "lint": "oxlint src/ test/",
    "test": "vitest run",
    "test:e2e": "vitest run --config ./vitest.config.e2e.ts"
  }
}
```
Core deps for every service: `@nestjs/{common,core,platform-express,config,swagger,typeorm,jwt,passport}`, `typeorm` + `pg`, `class-validator`, `class-transformer`, `joi`, `passport` + `passport-jwt`, `reflect-metadata`, `rxjs`. Add feature deps as needed (e.g. `viem` for wallet auth). Dev deps: `@nestjs/{cli,schematics,testing}`, `typescript`, `@types/node`, `@types/express`, `vitest` + `@vitest/coverage-v8`, `oxlint`, `@types/supertest`/`supertest`.

### `tsconfig.json` baseline (nodenext — "NextNest")
```jsonc
{
  "compilerOptions": {
    "module": "nodenext",
    "moduleResolution": "nodenext",   // resolve package exports, drive the .js-extension rule
    "resolvePackageJsonExports": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "declaration": true,              // emit .d.ts (+ removeComments, sourceMap) — nesting-ready
    "sourceMap": true,
    "isolatedModules": true,          // forces `import type` for type-only imports
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "strict": true,                   // do NOT loosen
    "strictPropertyInitialization": false,
    "skipLibCheck": true,
    "target": "ES2023",
    "outDir": "./dist",
    "incremental": true,              // generates *.tsbuildinfo — add `*.tsbuildinfo` to .gitignore
    "types": ["vitest/globals", "node"]
  }
}
```
Pair with `vitest.config.ts` (unit, `globals: true`, `include: ['**/*.spec.ts']`, `vite-tsconfig-paths` plugin so `nest g library` aliases resolve) and `vitest.config.e2e.ts` (e2e, `**/*.e2e-spec.ts`). Keep `nest-cli.json` defaults.

### `src/main.ts` — bootstrap
```ts
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,                  // needed later for webhook signature verification
    bodyParser: true,
    cors: { origin: '*' },
  });

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('<ProjectName>')
    .setDescription('<ProjectName> APIs list')
    .setVersion('1.0')
    .addBearerAuth()                // this adds the global Authorize button
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('chamber-of-secrets', app, document);  // docs path — pick any, keep it in main.ts + README + home UI button

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
```

### `src/app.module.ts` — root composition
```ts
import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import Joi from 'joi'; // default import, never `import * as Joi`
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';
import { DatabaseModule } from './database/database.module.js';
import { UserModule } from './user/user.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRATION_SECONDS: Joi.string().required(),
      }),
    }),
    DatabaseModule,                 // infra
    AuthModule, UserModule, ...     // feature modules
  ],
  controllers: [AppController],     // home page/status route
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
  ],
})
export class AppModule {}
```

### `src/database/database.module.ts`
```ts
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        synchronize: true,          // dev only
        autoLoadEntities: true,     // entities registered via TypeOrmModule.forFeature()
        url: configService.get('DATABASE_URL'),
      }),
    }),
  ],
})
export class DatabaseModule {}
```

### `src/common/filters/all-exceptions.filter.ts` — global error handling
Registered via `APP_FILTER` so every thrown `HttpException` (and any unexpected error) becomes one JSON shape:
```ts
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    const body = this.resolve(exception);
    const responseBody = {
      statusCode: body.httpStatus,
      message: body.message,
      ...(body.error ? { error: body.error } : {}),
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
    };
    httpAdapter.reply(ctx.getResponse(), responseBody, body.httpStatus);
  }

  private resolve(exception: unknown): { httpStatus: number; message: string; error?: string } {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') return { httpStatus: status, message: res, error: exception.name };
      if (typeof res === 'object' && res !== null) {
        const message = res['message'];
        return {
          httpStatus: status,
          message: Array.isArray(message) ? message.join(', ') : (message ?? exception.message),
          error: (res['error'] as string) ?? exception.name,
        };
      }
    }
    if (exception instanceof Error) {
      return { httpStatus: 500, message: exception.message, error: exception.name };
    }
    return { httpStatus: 500, message: 'Sorry we are experiencing technical problems', error: 'InternalServerError' };
  }
}
```

### `src/common/dto/api-response.dto.ts`
Success envelope (see §6). Both success and error paths share one contract.

### Swagger response typing
Don't annotate responses with bare DTOs — wrap them in the envelope so the docs match real responses:
```ts
export class UserResponseEnvelope extends ApiResponseDto<UserResponseDto> {
  @ApiProperty({ type: UserResponseDto })
  data: UserResponseDto = null as unknown as UserResponseDto; // TS2612 workaround; `declare` drops the decorator
}
```
Endpoints use `@ApiOkResponse({ type: UserResponseEnvelope })` / `@ApiCreatedResponse({ type: ... })`. Full pattern in §10.

### Root status UI (AppController + AppService)
Every service serves a branded status page at `/` so it's discoverable and links to the docs:
```ts
// app.controller.ts
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Get()
  @Header('Content-Type', 'text/html')
  getHome(): string {
    return this.appService.getHomePage();
  }
}
```
`app.service.ts` returns a template string — a single centered card on a dark background with a green **"Server is running"** pill, a title, a short description, and an **"Open API Docs"** button linking to the swagger path. Copy the HTML from `src/app.service.ts` and just swap the project title and docs link.

---

## 3. Module Layout (feature-first)

Each feature is a self-contained module with colocated files:

```
src/
├── main.ts                     # bootstrap only (pipes, cors, swagger, port)
├── app.module.ts               # root composition + global providers
├── app.controller.ts|service.ts|spec.ts
├── database/
│   └── database.module.ts
├── common/
│   ├── dto/api-response.dto.ts
│   └── filters/all-exceptions.filter.ts
├── user/                       # example feature module
│   ├── entities/user.entity.ts
│   ├── enums/user-role.enum.ts
│   ├── dto/{create,update,user-response}.dto.ts
│   ├── user.service.ts
│   ├── user.controller.ts
│   └── user.service.spec.ts    # colocated unit test
└── auth/
    ├── constants.ts            # SIGNATURE_MESSAGE
    ├── dto/{sign,login,auth-response}.dto.ts
    ├── strategies/jwt.strategy.ts   # passport strategy in its own subdir
    ├── jwt-auth.guard.ts       # AuthGuard('jwt') subclass + types
    ├── auth.service.ts
    ├── auth.controller.ts
    └── auth.service.spec.ts
```

**Folder rules per module**:
- `dto/` — all input/output DTOs (request bodies + `*ResponseDto`/envelopes). Never scatter DTOs at module root.
- `entities/` — TypeORM entities.
- `enums/` — enum definitions.
- `strategies/` — passport strategies only (e.g. `jwt.strategy.ts`). Keep guards at module root (`jwt-auth.guard.ts`).
- `test/` at repo root — e2e suites (`*.e2e-spec.ts`). Unit `*.spec.ts` files are colocated next to their source.
- One `*.spec.ts` next to each source file, mirroring `app.controller.spec.ts`.

**File naming conventions**:
- Input DTOs: `Create<Feature>Dto`, `Update<Feature>Dto` (extends `PartialType(Create<Feature>Dto)` from `@nestjs/swagger`), auth bodies: `SignDto`, `LoginDto`.
- Output DTOs: `<Feature>ResponseDto` (public view — no hidden fields), `<Feature>ResponseEnvelope` (extends `ApiResponseDto`), and `MeResponseDto` for the self-view that *includes* hidden fields like `role`.
- Entities: `<name>.entity.ts`; enums: `<name>.enum.ts`.
- Classes/methods: PascalCase classes, camelCase members. Module folders are `kebab-case` (`user`, `auth`), files are `<name>.module/controller/service/dto/spec.ts`.
- Response status gets a stable `@ApiProperty({ example: ... })` on every field.

---

## 4. Configuration

Global `ConfigModule` with a **Joi validation schema** (required keys fail fast):

```ts
ConfigModule.forRoot({
  isGlobal: true,
  validationSchema: Joi.object({
    DATABASE_URL: Joi.string().required(),
    JWT_SECRET: Joi.string().required(),
    JWT_EXPIRATION_SECONDS: Joi.string().required(),
  }),
})
```

Rules:
- Never hardcode or log `.env` values. Reference keys only.
- `ConfigService` is available everywhere (isGlobal) — no need to re-import `ConfigModule`.

---

## 5. Database (TypeORM)

Async config with `autoLoadEntities` (register entities via feature modules):

```ts
TypeOrmModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    type: 'postgres',
    url: config.get('DATABASE_URL'),
    synchronize: true, // dev only
    autoLoadEntities: true,
  }),
})
```

Feature modules register their own entities: `TypeOrmModule.forFeature([Entity])`.

---

## 6. Response Contract (the envelope)

Every endpoint returns the same envelope. Centralize it in `common/dto/api-response.dto.ts`:

```ts
export class ApiResponseDto<TPayload = undefined> {
  statusCode: number;
  success: boolean;
  message: string;
  data: TPayload;
  timestamp: string;
  path: string;

  static build<TPayload>(data, message, statusCode = 200, path = '') {
    return {
      statusCode, success: statusCode >= 200 && statusCode < 300,
      message, data, timestamp: new Date().toISOString(), path,
    };
  }
}
```

- Controllers never return bare data — always `return ApiResponseDto.build(result, '...', 200, '/route')`.
- The global `AllExceptionsFilter` (via `APP_FILTER`) keeps errors in the **same contract family**:

```jsonc
// success                                 // error
{
  statusCode: 200,                          {
  success: true,                              statusCode: 400,
  message: "Users fetched successfully",      message: "walletAddress must be a string",
  data: { ... },                              error: "Bad Request",      // only on failures
  timestamp: "2026-08-31T10:00:00.000Z",      timestamp: "2026-08-31T10:00:00.000Z",
  path: "/users"                              path: "/users"
}                                           }
```

Errors drop `success`/`data` and add `error`. Keep both shapes stable across the whole API — never invent a third.

---

## 7. Hiding Sensitive Fields (role, etc.)

Never `delete` entity fields. Mark fields with `@Expose` groups and let `ClassSerializerInterceptor` (registered via `APP_INTERCEPTOR`) hide them:

```ts
@Expose({ groups: ['full'] })
role: UserRole;
```

- Controller class level: `@SerializeOptions({ groups: ['public'] })` → role hidden everywhere.
- Routes that should include the private field (`/users/me`, login): `@SerializeOptions({ groups: ['full'] })` on the method.
- **Testing gotcha**: plain object mocks bypass `instanceToPlain` — repository mocks must return real entity class instances (`new User()` + `Object.assign`) or hidden fields leak through in tests.

---

## 8. Auth Flow (wallet-based EIP-191)

1. `POST /auth/sign` `{ walletAddress, privateKey }` → signs `"{SIGNATURE_MESSAGE}\n\nTimestamp: {unix}"` via viem `privateKeyToAccount(...).signMessage(...)`.
2. `POST /auth/login` `{ walletAddress, signature, timestamp }`:
   - validate presence → `BadRequestException`, non-numeric timestamp → `BadRequestException`, expired (>30 min old) → `BadRequestException('Signature expired')`;
   - recover signer via `recoverMessageAddress`; mismatch → `UnauthorizedException('Invalid signature')`;
   - find-or-create user by wallet;
   - `jwtService.signAsync({ walletAddress })` with `JWT_SECRET`, expiry `JWT_EXPIRATION_SECONDS`.
3. JWT payload is minimal: `{ walletAddress, iat, exp }`.

Token storage: `JwtModule.registerAsync({ global: true })` in the auth module.

**Login returns the full user (incl. role), like `/users/me`**: annotate the `login` handler with `@SerializeOptions({ groups: ['full'] })` and type the response `user` as `MeResponseDto` (not `UserResponseDto`), so the serialized payload and Swagger both include `role` (see §7).

---

## 9. Guard Architecture (passport-jwt, NOT plain JWT)

Use the passport stack: `@nestjs/passport` + `passport` + `passport-jwt` (all already in deps).

**Strategy** (`strategies/jwt.strategy.ts`):

```ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      passReqToCallback: true,                       // validate receives (req, payload)
      secretOrKey: configService.get<string>('JWT_SECRET', ''),
    });
  }
  async validate(_req: Request, payload: JwtPayload) {
    if (!payload.walletAddress) throw new UnauthorizedException();
    return { walletAddress: payload.walletAddress };
  }
}
```

**Guard** (`jwt-auth.guard.ts`) — subclass `AuthGuard('jwt')` and map failures:

```ts
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info) {
    if (err) {
      if (err instanceof UnauthorizedException) throw err;         // from validate(), keep its message
      const missing = err instanceof Error && err.message === 'No auth token';
      throw new UnauthorizedException(missing ? 'Missing bearer token' : 'Invalid or expired token');
    }
    if (!user) {
      // NOTE: passport-jwt surfaces "no token" via `info` as an Error, not `err`.
      const missing = info instanceof Error && info.message === 'No auth token';
      throw new UnauthorizedException(missing ? 'Missing bearer token' : 'Invalid or expired token');
    }
    return user;
  }
}
```

Export shared types from the guard file: `JwtPayload`, `AuthenticatedRequest extends Request` (`import type { Request } from 'express'`).

**Module wiring — critical**:
- **No separate "passport-auth" module.** Passport is *not* a feature — there is no `passport-auth.module.ts` and no dedicated passport sub-module. The strategy lives in `auth/strategies/` and the wiring lives inside the existing `AuthModule`:
  - Auth feature module imports `PassportModule.register({ defaultStrategy: 'jwt' })` (as a plain dependency, not a feature) and provides/exports `JwtStrategy` + `JwtAuthGuard`.
  - **Any module whose controller uses `JwtAuthGuard` must also import `PassportModule.register(...)`** (the guard resolves `AuthModuleOptions` in the host module's context). If AuthModule already imports that module, apply PassportModule there instead of importing AuthModule — avoids circular imports.

---

## 10. Swagger

- `main.ts`: `DocumentBuilder().setTitle(...).addBearerAuth().build()`, mounted via `SwaggerModule.setup('<path>', app, document)`. The `addBearerAuth()` call is what adds the Authorize button.
- Use `@ApiBearerAuth()` **only on genuinely protected routes** (e.g. `/users/me`). Do NOT put it on public login/token-issuing endpoints — it misleads the docs.
- Response DTOs extend the envelope and redeclare `data`:

```ts
export class LoginResponseEnvelope extends ApiResponseDto<LoginResponseDto> {
  @ApiProperty({ type: LoginResponseDto })
  data: LoginResponseDto = null as unknown as LoginResponseDto;  // TS2612 workaround; `declare` drops the decorator
}
```

- DTO examples: never paste full wallet addresses or keys — use truncated placeholders (`'0x7a25...Address'`).

---

## 11. HTTP Semantics

- `@Post()` returns **201 by default**; for 200-responding endpoints use `@HttpCode(HttpStatus.OK)` explicitly so the HTTP status matches the envelope `statusCode`.
- Errors: let Nest's built-in exceptions (`BadRequestException`, `NotFoundException`, `ConflictException`, `UnauthorizedException`) propagate — the global filter threads them into the envelope.

---

## 12. Testing Conventions

**Unit**: colocated `*.spec.ts`, build `TestingModule` with `Test.createTestingModule`, inject mocked classes via `useValue`. Mock dependencies only at the boundary (service ↔ repo, controller ↔ service). Example mock repo:

```ts
const mockUserRepository = { findOne: vi.fn(), find: vi.fn(), create: vi.fn(), save: vi.fn(), merge: vi.fn() };
```

Controller specs that use a guarded route: `overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })` instead of replacing `JwtService`.

Guard specs test the **real passport flow** (compile module with `PassportModule.register(...)` + real `JwtStrategy`, sign tokens with a real `JwtService({ secret })`, fake `ExecutionContext` providing `getRequest` **and** `getResponse`).

**E2E** (`test/app.e2e-spec.ts`): compile the full `AppModule` via `Test.createTestingModule`, but override DB to run without a live Postgres:

```ts
.overrideProvider(getRepositoryToken(User)).useValue(mockUserRepository)
.overrideProvider(DataSource).useValue({ isInitialized: false })
```

(`TypeOrmCoreModule`'s shutdown hook calls `moduleRef.get(DataSource)` — the mock must exist or `app.close()` fails.)

Test fixture salute: use the well-known hardhat test account
`0xac09…ff80 → 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
for signing, and a second key (`0x59c6…6d90 → 0x7099…9cC8`) to prove signature-mismatch rejection.

---

## 13. Commands

```bash
bun run build      # nest build
bun run test       # unit (vitest, *.spec.ts)
bun run test:e2e   # e2e (*.e2e-spec.ts)
bun run lint       # oxlint src/ test/
```

---

## 14. Adding a New Feature Module (checklist)

Walk this every time you add a feature (e.g. `orders/`) so nothing is forgotten:

1. **Scaffold folders**: `src/<feature>/{entities,dto,enums}` (+ `strategies` only if it needs passport strategies).
2. **Entity**: `<Feature>.entity.ts` — TypeORM decorators, mark any sensitive field with `@Expose({ groups: ['full'] })`.
3. **DTOs** (`dto/`): `Create<Feature>Dto`, `Update<Feature>Dto` (`PartialType(...)`), `<Feature>ResponseDto` (public, no hidden fields), `<Feature>ResponseEnvelope` for each response shape.
4. **Service** (`<feature>.service.ts`): inject the repo via `@InjectRepository(Feature)` (get it from `TypeOrmModule.forFeature([Feature])`). Throw `NotFoundException`/`ConflictException` from the service, not the controller.
5. **Controller** (`<feature>.controller.ts`):
   - `@SerializeOptions({ groups: ['public'] })` at class level.
   - Every handler: `return ApiResponseDto.build(result, '<Action> successfully', <status>, '/<feature>/...')` + matching `@ApiOkResponse({ type: ...ResponseEnvelope })`.
   - Authed routes: `@UseGuards(JwtAuthGuard)` + `@ApiBearerAuth()` + `@Req() req: AuthenticatedRequest`.
   - If the module adds any guarded route, import `PassportModule.register({ defaultStrategy: 'jwt' })` **in this module**.
6. **Module**: register in `<feature>.module.ts` (`TypeOrmModule.forFeature`, controllers, providers, exports) and add to `AppModule` imports.
7. **Tests**:
   - `service.spec.ts` — repo mocked at the boundary; assert error cases.
   - `controller.spec.ts` — service mocked; `overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })` for guarded routes.
   - e2e cases in `test/` — happy path envelope, 400 (validation), 401 (no/invalid token), 404 — reusing the repo/DataSource override stubs.
8. **Verify**: `bun run build`, `bun run test`, `bun run test:e2e`, `bun run lint` all green before finishing.