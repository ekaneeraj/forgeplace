import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { recoverMessageAddress } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { AuthService } from './auth.service';
import { SIGNATURE_MESSAGE } from './constants';
import { UserService } from '../user/user.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

const PRIVATE_KEY =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80' as `0x${string}`;
const account = privateKeyToAccount(PRIVATE_KEY);
const WALLET_ADDRESS = account.address.toLowerCase();

describe('AuthService', () => {
  let service: AuthService;

  const mockJwtService = { signAsync: vi.fn() };
  const mockUserService = {
    findByWalletAddress: vi.fn(),
    create: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('sign', () => {
    it('should produce a signature covering the SIGNATURE_MESSAGE', async () => {
      const result = await service.sign(WALLET_ADDRESS, PRIVATE_KEY);

      expect(result.walletAddress).toBe(WALLET_ADDRESS);
      expect(result.timestamp).toMatch(/^\d+$/);

      const recovered = await recoverMessageAddress({
        message: `${SIGNATURE_MESSAGE}\n\nTimestamp: ${result.timestamp}`,
        signature: result.signature as `0x${string}`,
      });

      expect(recovered.toLowerCase()).toBe(WALLET_ADDRESS);
    });
  });

  describe('login', () => {
    it('should throw BadRequestException on missing params', async () => {
      await expect(
        service.login({ walletAddress: '', signature: '', timestamp: '' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException on invalid timestamp', async () => {
      const { signature } = await service.sign(WALLET_ADDRESS, PRIVATE_KEY);

      await expect(
        service.login({ walletAddress: WALLET_ADDRESS, signature, timestamp: 'not-a-number' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException on expired timestamp', async () => {
      const { signature } = await service.sign(WALLET_ADDRESS, PRIVATE_KEY);

      await expect(
        service.login({ walletAddress: WALLET_ADDRESS, signature, timestamp: '1' }),
      ).rejects.toThrow('Signature expired');
    });

    it('should throw UnauthorizedException when the signature belongs to another wallet', async () => {
      const otherKey =
        '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d';
      const otherAccount = privateKeyToAccount(otherKey);
      const { signature, timestamp } = await service.sign(
        otherAccount.address.toLowerCase(),
        otherKey,
      );

      await expect(
        service.login({
          walletAddress: WALLET_ADDRESS,
          signature,
          timestamp,
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should create a new user and return an access token', async () => {
      const { signature, timestamp } = await service.sign(WALLET_ADDRESS, PRIVATE_KEY);
      const created = { id: 'u1', walletAddress: WALLET_ADDRESS, role: 'user' };
      mockUserService.findByWalletAddress.mockResolvedValue(null);
      mockUserService.create.mockResolvedValue(created);
      mockJwtService.signAsync.mockResolvedValue('access-token');

      const result = await service.login({ walletAddress: WALLET_ADDRESS, signature, timestamp });

      expect(mockUserService.create).toHaveBeenCalledWith({ walletAddress: WALLET_ADDRESS });
      expect(result.accessToken).toBe('access-token');
      expect(result.user).toEqual(created);
      expect(result.timestamp).toEqual(expect.any(Number));
    });

    it('should reuse an existing user and not call create', async () => {
      const { signature, timestamp } = await service.sign(WALLET_ADDRESS, PRIVATE_KEY);
      const existing = { id: 'u1', walletAddress: WALLET_ADDRESS, role: 'user' };
      mockUserService.findByWalletAddress.mockResolvedValue(existing);
      mockJwtService.signAsync.mockResolvedValue('access-token');

      const result = await service.login({ walletAddress: WALLET_ADDRESS, signature, timestamp });

      expect(mockUserService.findByWalletAddress).toHaveBeenCalledWith(WALLET_ADDRESS);
      expect(mockUserService.create).not.toHaveBeenCalled();
      expect(result.user).toEqual(existing);
    });
  });
});