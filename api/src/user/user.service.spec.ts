import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;

  const mockUserRepository = {
    findOne: vi.fn(),
    find: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
    merge: vi.fn(),
  };

  const walletAddress = '0xabc...';

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  describe('create', () => {
    it('should create and save a new user', async () => {
      const dto = { walletAddress };
      const created = { id: '1', walletAddress };
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(created);
      mockUserRepository.save.mockResolvedValue(created);

      await expect(service.create(dto)).resolves.toEqual(created);
      expect(mockUserRepository.create).toHaveBeenCalledWith(dto);
    });

    it('should throw ConflictException when wallet already exists', async () => {
      const dto = { walletAddress };
      mockUserRepository.findOne.mockResolvedValue({ id: '1', walletAddress });

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findByWalletAddress', () => {
    it('should return the user when found', async () => {
      const user = { id: '1', walletAddress };
      mockUserRepository.findOne.mockResolvedValue(user);

      await expect(service.findByWalletAddress(walletAddress)).resolves.toEqual(user);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { walletAddress } });
    });

    it('should return null when not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.findByWalletAddress(walletAddress)).resolves.toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = [{ id: '1' }, { id: '2' }];
      mockUserRepository.find.mockResolvedValue(users);

      await expect(service.findAll()).resolves.toEqual(users);
    });
  });

  describe('findById', () => {
    it('should return the user when found', async () => {
      const user = { id: '1', walletAddress };
      mockUserRepository.findOne.mockResolvedValue(user);

      await expect(service.findById('1')).resolves.toEqual(user);
    });

    it('should throw NotFoundException when not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.findById('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should merge dto into user and save', async () => {
      const user = { id: '1', walletAddress, name: 'old' };
      const dto = { name: 'new' };
      const updated = { ...user, ...dto };
      mockUserRepository.findOne.mockResolvedValue(user);
      mockUserRepository.merge.mockImplementation(
        (target: object, patch: object) => Object.assign(target, patch),
      );
      mockUserRepository.save.mockResolvedValue(updated);

      await expect(service.update('1', dto)).resolves.toEqual(updated);
      expect(mockUserRepository.merge).toHaveBeenCalledWith(user, dto);
    });

    it('should throw NotFoundException when user missing', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.update('1', { name: 'new' })).rejects.toThrow(NotFoundException);
    });
  });
});