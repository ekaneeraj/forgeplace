import { ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard, AuthenticatedRequest } from './jwt-auth.guard';
import { JwtStrategy } from './strategies/jwt.strategy';

const JWT_SECRET = 'test-secret';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let jwtService: JwtService;

  const createContext = (request: Partial<AuthenticatedRequest>): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => ({}),
      }),
    }) as unknown as ExecutionContext;

  beforeEach(async () => {
    jwtService = new JwtService({ secret: JWT_SECRET });

    const module: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      providers: [
        JwtAuthGuard,
        JwtStrategy,
        { provide: ConfigService, useValue: { get: () => JWT_SECRET } },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
  });

  it('should throw UnauthorizedException when no bearer token is present', async () => {
    const context = createContext({ headers: {} });

    await expect(guard.canActivate(context)).rejects.toThrow('Missing bearer token');
  });

  it('should throw UnauthorizedException on an invalid token', async () => {
    const context = createContext({
      headers: { authorization: 'Bearer not-a-valid-token' },
    });

    await expect(guard.canActivate(context)).rejects.toThrow('Invalid or expired token');
  });

  it('should throw UnauthorizedException on an expired token', async () => {
    const expired = await jwtService.signAsync(
      { walletAddress: '0xabc...' },
      { expiresIn: 1 },
    );
    await new Promise((r) => setTimeout(r, 1100));

    const context = createContext({
      headers: { authorization: `Bearer ${expired}` },
    });

    await expect(guard.canActivate(context)).rejects.toThrow('Invalid or expired token');
  });

  it('should throw UnauthorizedException when the token payload lacks walletAddress', async () => {
    const token = await jwtService.signAsync({});
    const context = createContext({
      headers: { authorization: `Bearer ${token}` },
    });

    await expect(guard.canActivate(context)).rejects.toThrow('Unauthorized');
  });

  it('should attach the wallet address and allow the request on a valid token', async () => {
    const token = await jwtService.signAsync({ walletAddress: '0xabc...' });
    const request: Partial<AuthenticatedRequest> = {
      headers: { authorization: `Bearer ${token}` },
    };

    await expect(guard.canActivate(createContext(request))).resolves.toBe(true);
    expect(request.user).toEqual({ walletAddress: '0xabc...' });
  });
});