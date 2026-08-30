import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    sign: vi.fn(),
    login: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('sign', () => {
    it('should throw BadRequestException when params missing', async () => {
      await expect(
        controller.sign({ walletAddress: '0xabc...', privateKey: '' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should delegate to the service and wrap in an envelope', async () => {
      const dto = { walletAddress: '0xabc...', privateKey: '0xkey' };
      const result = { signature: '0xsig', timestamp: '123', walletAddress: '0xabc...' };
      mockAuthService.sign.mockResolvedValue(result);

      const response = await controller.sign(dto);

      expect(mockAuthService.sign).toHaveBeenCalledWith('0xabc...', '0xkey');
      expect(response).toMatchObject({
        statusCode: 201,
        success: true,
        message: 'Signature created successfully',
        data: result,
        path: '/auth/sign',
      });
    });
  });

  describe('login', () => {
    it('should delegate to the service and wrap in an envelope', async () => {
      const dto = { walletAddress: '0xabc...', signature: '0xsig', timestamp: '123' };
      const result = { accessToken: 'token', user: {}, timestamp: 123 };
      mockAuthService.login.mockResolvedValue(result);

      const response = await controller.login(dto);

      expect(mockAuthService.login).toHaveBeenCalledWith(dto);
      expect(response).toMatchObject({
        statusCode: 200,
        message: 'Logged in successfully',
        data: result,
        path: '/auth/login',
      });
    });
  });
});