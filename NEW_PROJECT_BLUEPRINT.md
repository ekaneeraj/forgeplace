# Complete Blueprint — New CommonJS NestJS Project (ForgePlace flow)

Use this to recreate the ForgePlace/MintPlace API from scratch with a **CommonJS** NestJS
project. Copy the files verbatim (adjust `name`, swagger title, `SIGNATURE_MESSAGE`, `.env`).

---

## 1. Stack & golden rules

| Item | Value |
|---|---|
| Runtime | **CommonJS** (`module: commonjs`) |
| NestJS | v10/v11 line (matches `@nestjs/passport` v11) |
| DB | Postgres via TypeORM 1.x |
| Auth | Wallet-signature login + Passport-jwt |
| Tests | `jest` (or vitest — your call) |

Golden rules (what keeps this exact setup working):
- Do **NOT** add `"type": "module"` to `package.json` (that is what flips a project to ESM).
- `module: commonjs` in `tsconfig.json` — imports need **no** `.js` extension.
- `import * as Joi from 'joi'` works here (CJS). `__dirname` works.
- `removeComments`, `nest-cli` defaults, and `strictNullChecks: false` keep decorated code
  compiling exactly like MintPlace.
- Guard works with bare `PassportModule` import **only** when `@nestjs/passport` is **v11 or
  older** (v12 requires `AuthModuleOptions` in every module that uses a guard — see §9).

---

## 2. Project init

```bash
nest new api
cd api
# runtime deps (bun or npm — e.g. hint installs with bun)
bun add @nestjs/config @nestjs/typeorm @nestjs/jwt @nestjs/passport passport passport-jwt typeorm pg joi viem class-transformer class-validator @nestjs/swagger bcrypt @nestjs/axios axios helmet query-string async uuid
# dev deps
bun add -d @types/passport-jwt @types/express @types/bcrypt
```

See the full pinned list in the `package.json` block above — copy it in to match the
blueprint exactly.

### `package.json` (complete dependencies)

```jsonc
{
  "dependencies": {
    "@nestjs/axios": "^4.0.1",
    "@nestjs/common": "^10.0.0",   // ^11 also fine — keep @nestjs/passport: ^11
    "@nestjs/config": "^4.0.4",
    "@nestjs/core": "^10.0.0",
    "@nestjs/jwt": "^11.0.2",
    "@nestjs/passport": "^11.0.5", // <-- v11 on purpose (v12 changes guard DI)
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/swagger": "^11.4.6",
    "@nestjs/typeorm": "^11.0.3",
    "async": "^3.2.6",
    "axios": "^1.18.1",
    "bcrypt": "^6.0.0",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.15.1",
    "helmet": "^8.3.0",
    "joi": "^18.2.3",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "pg": "^8.22.0",
    "query-string": "^9.4.1",
    "reflect-metadata": "^0.1.13",
    "rxjs": "^7.8.1",
    "typeorm": "^1.1.0",
    "uuid": "^14.0.1",
    "viem": "^2.55.8"              // wallet signing / recoverMessageAddress
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@nestjs/schematics": "^10.0.0",
    "@nestjs/testing": "^10.0.0",
    "@types/bcrypt": "^6.0.0",
    "@types/express": "^4.17.17",
    "@types/jest": "^29.5.2",
    "@types/node": "^20.3.1",
    "@types/passport-jwt": "^4.0.1",
    "@types/supertest": "^6.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.42.0",
    "eslint-config-prettier": "^9.0.0",
    "eslint-plugin-prettier": "^5.0.0",
    "jest": "^29.5.0",
    "prettier": "^3.0.0",
    "source-map-support": "^0.5.21",
    "supertest": "^6.3.3",
    "ts-jest": "^29.1.0",
    "ts-loader": "^9.4.3",
    "ts-node": "^10.9.1",
    "tsconfig-paths": "^4.2.0",
    "typescript": "^5.1.3"
  }
}
```

> Core package to be intentional about: **`@nestjs/passport` must stay `^11`** when pairing
> with Nest 10/11 (see §13 for the v12 change).

---

## 3. Config files

### `package.json` (the important parts)

```jsonc
{
  "name": "api",
  // NOTE: no "type": "module" — defaults to CommonJS
  "scripts": {
    "build": "nest build",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:e2e": "jest --config ./test/jest-e2e.json"
  }
}
```

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": false,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "forceConsistentCasingInFileNames": false,
    "noFallthroughCasesInSwitch": false
  }
}
```

### `nest-cli.json`

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": { "deleteOutDir": true }
}
```

---

## 4. File tree

```
src/
  main.ts
  app.module.ts
  app.controller.ts
  app.service.ts
  common/filters/all-exceptions.filter.ts
  database/database.module.ts
  auth/
    auth.module.ts
    auth.controller.ts
    auth.service.ts
    jwt-auth.guard.ts
    constants.ts
    dto/sign.dto.ts
    dto/login.dto.ts
    strategies/jwt.strategy.ts
  user/
    user.module.ts
    user.controller.ts
    user.service.ts
    entities/user.entity.ts
    enums/user-role.enum.ts
    dto/create-user.dto.ts
    dto/update-user.dto.ts
.env (DATABASE_URL, JWT_SECRET, JWT_EXPIRATION_SECONDS, PORT)
```

---

## 5. Entry + root module

### `src/main.ts`

```ts
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
    bodyParser: true,
    cors: { origin: '*' },
  });

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('ForgePlace')
    .setDescription('ForgePlace APIs list')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('chamber-of-secrets', app, document);

  await app.listen(process.env.PORT || 4242);
}
bootstrap();
```

> CJS note: no top-level `await bootstrap()` — just call it.

### `src/app.module.ts`

```ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import * as Joi from 'joi';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        JWT_EXPIRATION_SECONDS: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
      }),
    }),
    DatabaseModule,
    AuthModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
```

---

## 6. Database module (own module, keeps app.module short)

### `src/database/database.module.ts`

```ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as path from 'path';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          type: 'postgres',
          synchronize: true,
          url: configService.get('DATABASE_URL'),
          // ssl: {
          //   rejectUnauthorized: false,
          // },
          entities: [path.resolve(__dirname, './../**/*.entity{.ts,.js}')],
        };
      },
    }),
  ],
})
export class DatabaseModule {}
```

> `__dirname` glob works because CJS.

---

## 7. User module (schema + CRUD)

### `src/user/enums/user-role.enum.ts`

```ts
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}
```

### `src/user/entities/user.entity.ts`

```ts
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole } from '../enums/user-role.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  walletAddress: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ nullable: true })
  name: string;

  @Column({ name: 'profile_image_url', nullable: true })
  profileImageUrl: string;

  @Column({ name: 'cover_image_url', nullable: true })
  coverImageUrl: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

### `src/user/dto/create-user.dto.ts`

```ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEthereumAddress,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { UserRole } from '../enums/user-role.enum';

export class CreateUserDto {
  @ApiProperty()
  @Transform(({ value }) => value?.toLowerCase())
  @IsEthereumAddress()
  walletAddress: string;

  @ApiPropertyOptional({ enum: UserRole, default: UserRole.USER })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  profileImageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  coverImageUrl?: string;
}
```

### `src/user/dto/update-user.dto.ts`

```ts
import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}
```

### `src/user/user.service.ts`

```ts
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.userRepository.findOne({
      where: { walletAddress: dto.walletAddress },
    });

    if (existing) {
      throw new ConflictException('User with this wallet address already exists');
    }

    const user = this.userRepository.create(dto);
    return this.userRepository.save(user);
  }

  async findByWalletAddress(walletAddress: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { walletAddress } });
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    this.userRepository.merge(user, dto);
    return this.userRepository.save(user);
  }
}
```

### `src/user/user.controller.ts`

```ts
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getCurrentUser(@Req() req: Request) {
    const { walletAddress } = req.user as { walletAddress: string };
    return this.userService.findByWalletAddress(walletAddress);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const user = await this.userService.findById(id);
    delete user.role;
    return user;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }
}
```

### `src/user/user.module.ts`

```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService, TypeOrmModule],
})
export class UserModule {}
```

---

## 8. Auth module

### `src/auth/constants.ts`

```ts
export const SIGNATURE_MESSAGE =
  'Hello, \nMintPlace uses a cryptographic signature to \nauthenticate your wallet address and will never \nrequest access to your funds. The signature request \nis a gas-free transaction.';
```

### `src/auth/dto/sign.dto.ts`

```ts
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEthereumAddress, IsString } from 'class-validator';

export class SignDto {
  @ApiProperty()
  @Transform(({ value }) => value?.toLowerCase())
  @IsEthereumAddress()
  walletAddress: string;

  @ApiProperty()
  @IsString()
  privateKey: string;
}
```

### `src/auth/dto/login.dto.ts`

```ts
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEthereumAddress, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty()
  @Transform(({ value }) => value?.toLowerCase())
  @IsEthereumAddress()
  walletAddress: string;

  @ApiProperty()
  @IsString()
  signature: string;

  @ApiProperty()
  @IsString()
  timestamp: string;
}
```

### `src/auth/jwt-auth.guard.ts`

```ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

### `src/auth/strategies/jwt.strategy.ts`

```ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface JwtPayload {
  walletAddress: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    if (!payload.walletAddress) {
      throw new UnauthorizedException();
    }
    return { walletAddress: payload.walletAddress };
  }
}
```

### `src/auth/auth.service.ts`

```ts
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { recoverMessageAddress } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { LoginDto } from './dto/login.dto';
import { SIGNATURE_MESSAGE } from './constants';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async sign(walletAddress: string, privateKey: string) {
    const timestamp = (new Date().getTime() / 1e3).toFixed(0);
    const message = `${SIGNATURE_MESSAGE}\n\nTimestamp: ${timestamp}`;

    const signature = await privateKeyToAccount(
      privateKey as `0x${string}`,
    ).signMessage({ message });

    return { signature, timestamp, walletAddress };
  }

  async login(dto: LoginDto) {
    const { walletAddress, signature, timestamp } = dto;

    if (!signature || !timestamp || !walletAddress) {
      throw new BadRequestException('Invalid signature params');
    }

    const timestampSeconds = Number(timestamp);
    if (!Number.isFinite(timestampSeconds)) {
      throw new BadRequestException('Invalid timestamp');
    }

    if (new Date().getTime() / 1e3 - 30 * 60 > timestampSeconds) {
      throw new BadRequestException('Signature expired');
    }

    const message = `${SIGNATURE_MESSAGE}\n\nTimestamp: ${timestamp}`;
    const recoveredAddress = await recoverMessageAddress({
      message,
      signature: signature as `0x${string}`,
    });

    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      throw new UnauthorizedException('Invalid signature');
    }

    let user = await this.userService.findByWalletAddress(walletAddress);

    if (!user) {
      user = await this.userService.create({ walletAddress });
    }

    const accessToken = await this.jwtService.signAsync({ walletAddress });
    const loginTimestamp = Math.floor(Date.now() / 1000);
    return {
      accessToken,
      user,
      timestamp: loginTimestamp,
    };
  }
}
```

### `src/auth/auth.controller.ts`

```ts
import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignDto } from './dto/sign.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign')
  async sign(@Body() dto: SignDto) {
    if (!dto.privateKey || !dto.walletAddress) {
      throw new BadRequestException('walletAddress and privateKey are required');
    }
    return this.authService.sign(dto.walletAddress, dto.privateKey);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
```

### `src/auth/auth.module.ts`

```ts
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    PassportModule,
    UserModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: Number(configService.get('JWT_EXPIRATION_SECONDS')),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

---

## 9. Global exception filter

### `src/common/filters/all-exceptions.filter.ts`

```ts
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

interface ErrorResponse {
  httpStatus: number;
  message: string;
  error?: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const { httpStatus, message, error } = this.resolveException(exception);

    const responseBody = {
      statusCode: httpStatus,
      message,
      ...(error ? { error } : {}),
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }

  private resolveException(exception: unknown): ErrorResponse {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();

      if (typeof response === 'string') {
        return { httpStatus: status, message: response, error: exception.name };
      }

      if (this.isObject(response)) {
        const message = response['message'] as string | undefined;
        const error = response['error'] as string | undefined;

        if (Array.isArray(message)) {
          return { httpStatus: status, message: message.join(', '), error };
        }

        return {
          httpStatus: status,
          message: message ?? exception.message,
          error: error ?? exception.name,
        };
      }
    }

    if (exception instanceof Error) {
      return {
        httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
        message: exception.message,
        error: exception.name,
      };
    }

    return {
      httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Sorry we are experiencing technical problems',
      error: 'InternalServerError',
    };
  }

  private isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}
```

---

## 10. Environment

`.env`

```env
DATABASE_URL=postgres://user:pass@localhost:5432/forgeplace
JWT_SECRET=change_me
JWT_EXPIRATION_SECONDS=86400
PORT=4242
```

Env vars validated by Joi at boot (all required): `DATABASE_URL`, `JWT_SECRET`,
`JWT_EXPIRATION_SECONDS`. `PORT` is optional (`main.ts` falls back to 4242).

---

## 11. Flow

```
Frontend wallet                     AuthController/AuthService
    │  (a) /auth/sign (dev helper, send privateKey+wallet)
    ├──────────────────────────────►  builds SIGNATURE_MESSAGE + Timestamp:<unix>
    ◄──── { signature, timestamp, walletAddress }
    │
    │  (b) /auth/login { walletAddress, signature, timestamp }
    ├──────────────────────────────►  1. timestamp parse + < 30 min old
    │                                2. recoverMessageAddress(message, signature)
    │                                    must equal walletAddress (lowercased)
    │                                3. find user by wallet; if missing → create
    │                                    (users.walletAddress is UNIQUE → no dupes)
    │                                4. sign JWT { walletAddress } (JWT_SECRET)
    ◄──── { accessToken, user, timestamp }

Protected routes (e.g. GET /users/me):
  Authorization: Bearer <accessToken>
    ─► JwtAuthGuard ─► JwtStrategy.verify (JWT_SECRET) ─► validate() returns
        { walletAddress } ─► controller does DB lookup (findByWalletAddress)
```

| Endpoint | Auth | Body / Params | Returns |
|---|---|---|---|
| `POST /auth/sign` | — | `{ walletAddress, privateKey }` | `{ signature, timestamp, walletAddress }` |
| `POST /auth/login` | — | `{ walletAddress, signature, timestamp }` | `{ accessToken, user, timestamp }` |
| `GET /users/me` | Bearer | — | current `User` |
| `GET /users` | — | — | `User[]` |
| `GET /users/:id` | — | — | `User` (role stripped) |
| `PATCH /users/:id` | — | `Partial<CreateUserDto>` | updated `User` |

Swagger (with bearer auth): **`/chamber-of-secrets`**

---

## 12. Data schema — `users`

| column | type | notes |
|---|---|---|
| id | uuid (PK) | `@PrimaryGeneratedColumn('uuid')` |
| walletAddress | varchar | `unique: true` → one account per wallet |
| role | enum(user, admin) | default `user` |
| name | varchar | nullable |
| profile_image_url | varchar | nullable |
| cover_image_url | varchar | nullable |
| created_at | timestamptz | `@CreateDateColumn` |
| updated_at | timestamptz | `@UpdateDateColumn` |

Table name + column aliases are produced by TypeORM `synchronize: true` — no manual SQL.

---

## 13. Gotchas (things that will bite otherwise)

1. **No `"type": "module"`.** Adding it flips the project to ESM: `.js`-less imports break,
   `import * as Joi` breaks, `__dirname` disappears.
2. **`@nestjs/passport` stays v11.** v12 changes `AuthGuard` DI: it requires
   `AuthModuleOptions` in every module that instantiates a guard (this is the
   `UnknownDependenciesException: ...JwtAuthGuard...` you see on Nest 12). If you must use
   Nest 12 + passport 12, every module using a guard needs `PassportModule.register(...)` in
   its imports (or a `@Global()` PassportAuthModule registered once in `app.module`).
3. **Top-level `await`** in `main.ts` only exists in ESM — CommonJS calls `bootstrap()`.
4. **`delete user.role`** (in `GET /users/:id`) compiles because `strictNullChecks: false`;
   keep it in `tsconfig.json` or sanitize differently.
5. **Version coupling table:**

| NestJS | @nestjs/passport | Bare `PassportModule` guard works anywhere |
|---|---|---|
| 10/11 | ^11 | ✅ Yes |
| 12 | ^12 | ❌ No — needs options provider in scope |