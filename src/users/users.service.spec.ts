import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service.js';
import { User, UserRole } from './user.entity.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import * as bcrypt from 'bcrypt';
import { getRepositoryToken } from '@nestjs/typeorm';

vi.mock('bcrypt', () => ({
  hash: vi.fn().mockResolvedValue('hashed-password'),
}));

describe('UsersService', () => {
  let service: UsersService;
  let repository: any;

    beforeEach(async () => {
      (bcrypt.hash as any).mockResolvedValue('hashed-password');
      repository = {
        findOneBy: vi.fn(),
        create: vi.fn(),
        save: vi.fn(),
        find: vi.fn(),
        findOneByOrFail: vi.fn(),
      };

    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: getRepositoryToken(User), useValue: repository }],
    }).compile();

    service = module.get<UsersService>(UsersService);
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should hash the password with bcrypt and never return it', async () => {
      const dto: CreateUserDto = { email: 'tecnico@fleet.local', password: 'Tecnico123!' };
      (bcrypt.hash as any).mockResolvedValue('hashed-password');
      repository.findOneBy.mockResolvedValue(null);
      repository.create.mockImplementation((entity: any) => entity);
      repository.save.mockResolvedValue({
        id: 1,
        email: 'tecnico@fleet.local',
        password: 'hashed-password',
        role: UserRole.TECHNICIAN,
      });

      const result = await service.create(dto);

      expect(bcrypt.hash).toHaveBeenCalledWith('Tecnico123!', 10);
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ password: 'hashed-password' }),
      );
      expect(result.email).toBe('tecnico@fleet.local');
      expect(result.role).toBe(UserRole.TECHNICIAN);
      expect(Object.prototype.hasOwnProperty.call(result, 'password')).toBe(false);
    });

    it('should throw when the email is already registered', async () => {
      repository.findOneBy.mockResolvedValue({ id: 1, email: 'a@b.com' });
      await expect(
        service.create({ email: 'a@b.com', password: 'password123' }),
      ).rejects.toThrow('ya está registrado');
    });
  });
});
