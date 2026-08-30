import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;

  const mockUserService = {
    findAll: vi.fn(),
    findById: vi.fn(),
    findByWalletAddress: vi.fn(),
    update: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockUserService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UserController>(UserController);
  });

  describe('getCurrentUser', () => {
    it('should return the current user envelope using req.user', async () => {
      const user = { id: '1', walletAddress: '0xabc...' };
      mockUserService.findByWalletAddress.mockResolvedValue(user);
      const req = { user: { walletAddress: '0xabc...' } };

      const result = await controller.getCurrentUser(req as never);

      expect(mockUserService.findByWalletAddress).toHaveBeenCalledWith('0xabc...');
      expect(result).toMatchObject({
        statusCode: 200,
        success: true,
        message: 'Current user fetched successfully',
        data: user,
        path: '/users/me',
      });
    });
  });

  describe('findAll', () => {
    it('should return users wrapped in a list envelope', async () => {
      const users = [{ id: '1' }, { id: '2' }];
      mockUserService.findAll.mockResolvedValue(users);

      const result = await controller.findAll();

      expect(result).toMatchObject({
        statusCode: 200,
        message: 'Users fetched successfully',
        data: users,
        path: '/users',
      });
    });
  });

  describe('findById', () => {
    it('should return the user envelope', async () => {
      const user = { id: '1' };
      mockUserService.findById.mockResolvedValue(user);

      const result = await controller.findById('1');

      expect(mockUserService.findById).toHaveBeenCalledWith('1');
      expect(result).toMatchObject({
        statusCode: 200,
        message: 'User fetched successfully',
        data: user,
        path: '/users/1',
      });
    });
  });

  describe('update', () => {
    it('should update and return the user envelope', async () => {
      const user = { id: '1', name: 'new' };
      const dto = { name: 'new' };
      mockUserService.update.mockResolvedValue(user);

      const result = await controller.update('1', dto);

      expect(mockUserService.update).toHaveBeenCalledWith('1', dto);
      expect(result).toMatchObject({
        statusCode: 200,
        message: 'User updated successfully',
        data: user,
        path: '/users/1',
      });
    });
  });
});