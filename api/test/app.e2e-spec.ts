import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { privateKeyToAccount } from 'viem/accounts';
import { AppModule } from './../src/app.module';
import { User } from './../src/user/entities/user.entity';

const PRIVATE_KEY =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80' as `0x${string}`;
const account = privateKeyToAccount(PRIVATE_KEY);
const WALLET_ADDRESS = account.address.toLowerCase();

const makeUser = (overrides: Partial<User> = {}): User => {
  const user = new User();
  Object.assign(user, {
    id: 'bfe6f8a4-0000-0000-0000-000000000001',
    walletAddress: WALLET_ADDRESS,
    role: 'user' as User['role'],
    name: 'Test User',
    profileImageUrl: null,
    coverImageUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });
  return user;
};

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  const mockUserRepository = {
    findOne: vi.fn().mockImplementation(({ where }) => {
      const hasWallet = where?.walletAddress === WALLET_ADDRESS;
      const hasId = where?.id === makeUser().id;
      return Promise.resolve(hasWallet || hasId ? makeUser() : null);
    }),
    find: vi.fn().mockResolvedValue([makeUser()]),
    create: vi.fn().mockImplementation((dto) => makeUser(dto)),
    save: vi.fn().mockImplementation((user) => Promise.resolve(user)),
    merge: vi.fn().mockImplementation((target, patch) => Object.assign(target, patch)),
  };

  const mockDataSource = {
    isInitialized: false,
    destroy: vi.fn(),
    entityMetadatas: [],
    options: { type: 'postgres' },
    getRepository: vi.fn().mockReturnValue(mockUserRepository),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getRepositoryToken(User))
      .useValue(mockUserRepository)
      .overrideProvider(DataSource)
      .useValue(mockDataSource)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

    const config = new DocumentBuilder()
      .setTitle('ForgePlace')
      .setDescription('ForgePlace Wallet API Documentation')
      .addBearerAuth()
      .build();
    SwaggerModule.setup('chamber-of-secrets', app, SwaggerModule.createDocument(app, config));

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /', () => {
    it('should return the home UI page', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect('Content-Type', /text\/html/)
        .expect((res) => {
          expect(res.text).toContain('ForgePlace');
        });
    });
  });

  describe('GET /chamber-of-secrets', () => {
    it('should serve the swagger document', () => {
      return request(app.getHttpServer())
        .get('/chamber-of-secrets-json')
        .expect(200)
        .expect((res) => {
          expect(res.body.info.title).toBe('ForgePlace');
          expect(res.body.paths['/users/me']).toBeDefined();
        });
    });
  });

  describe('POST /auth/sign', () => {
    it('should produce a signature payload', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/sign')
        .send({ walletAddress: account.address, privateKey: PRIVATE_KEY })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.signature).toBeTruthy();
      expect(res.body.data.walletAddress).toBe(WALLET_ADDRESS);
    });

    it('should reject a bad wallet address (400)', async () => {
      await request(app.getHttpServer())
        .post('/auth/sign')
        .send({ walletAddress: 'not-an-address', privateKey: PRIVATE_KEY })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should reject an invalid body (400)', () => {
      return request(app.getHttpServer()).post('/auth/login').send({}).expect(400);
    });

    it('should login and return an access token', async () => {
      const sign = await request(app.getHttpServer())
        .post('/auth/sign')
        .send({ walletAddress: account.address, privateKey: PRIVATE_KEY })
        .expect(201);

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          walletAddress: sign.body.data.walletAddress,
          signature: sign.body.data.signature,
          timestamp: sign.body.data.timestamp,
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeTruthy();
      expect(res.body.data.user.walletAddress).toBe(WALLET_ADDRESS);
      expect(res.body.data.user.role).toBe('user');
    });
  });

  describe('GET /users', () => {
    it('should return users without role', async () => {
      const res = await request(app.getHttpServer()).get('/users').expect(200);

      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data[0]).not.toHaveProperty('role');
    });
  });

  describe('GET /users/:id', () => {
    it('should return a 404 envelope for an unknown user', async () => {
      const res = await request(app.getHttpServer()).get('/users/unknown-id').expect(404);

      expect(res.body.statusCode).toBe(404);
      expect(res.body.message).toBe('User not found');
    });

    it('should return the user without role', async () => {
      const id = makeUser().id;
      const res = await request(app.getHttpServer())
        .get(`/users/${id}`)
        .expect(200);

      expect(res.body.data.id).toBe(id);
      expect(res.body.data.role).toBeUndefined();
    });
  });

  describe('GET /users/me', () => {
    const getToken = async () => {
      const sign = await request(app.getHttpServer())
        .post('/auth/sign')
        .send({ walletAddress: account.address, privateKey: PRIVATE_KEY })
        .expect(201);
      const login = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          walletAddress: sign.body.data.walletAddress,
          signature: sign.body.data.signature,
          timestamp: sign.body.data.timestamp,
        })
        .expect(200);
      return login.body.data.accessToken;
    };

    it('should reject when no bearer token is provided', async () => {
      const res = await request(app.getHttpServer()).get('/users/me').expect(401);
      expect(res.body.message).toBe('Missing bearer token');
    });

    it('should reject an invalid token', async () => {
      const res = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', 'Bearer not-a-valid-token')
        .expect(401);
      expect(res.body.message).toBe('Invalid or expired token');
    });

    it('should return the current user including role', async () => {
      const token = await getToken();

      const res = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.data.walletAddress).toBe(WALLET_ADDRESS);
      expect(res.body.data.role).toBe('user');
    });
  });
});