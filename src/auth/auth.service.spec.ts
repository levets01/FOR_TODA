import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service.js';
import { UsersService } from '../users/users.service.js';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';


vi.mock('bcrypt', () => ({
  hash: vi.fn(),
  compare: vi.fn().mockResolvedValue(true),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: any;
  let jwtService: any;

  beforeEach(async () => {
    usersService = {
      findByEmail: vi.fn(),
      create: vi.fn(),
    };
    jwtService = { signAsync: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should issue a JWT and never return the password', async () => {
      usersService.create.mockResolvedValue({
        id: 1,
        email: 'admin@fleet.local',
        role: 'ADMIN',
      });
      jwtService.signAsync.mockResolvedValue('jwt-token');

      const result = await service.register({
        email: 'admin@fleet.local',
        password: 'Admin123!',
      });

      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'admin@fleet.local' }),
      );
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: 1,
        email: 'admin@fleet.local',
        roles: ['ADMIN'],
      });
      expect(result.accessToken).toBe('jwt-token');
      expect(result.user).toEqual({ id: 1, email: 'admin@fleet.local', role: 'ADMIN' });
    });
  });

  describe('login', () => {
    it('should issue a JWT when credentials are valid', async () => {
      const user = {
        id: 1,
        email: 'tecnico@fleet.local',
        password: 'hashed-password',
        role: 'TECHNICIAN',
      };
      usersService.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as any).mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue('jwt-token');

      const result = await service.login({
        email: 'tecnico@fleet.local',
        password: 'Tecnico123!',
      });

      expect(result.accessToken).toBe('jwt-token');
    });

    it('should throw when the user does not exist', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      await expect(
        service.login({ email: 'noexiste@fleet.local', password: 'x' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw when the password is incorrect', async () => {
      usersService.findByEmail.mockResolvedValue({
        id: 1,
        email: 'tecnico@fleet.local',
        password: 'hashed-password',
        role: 'TECHNICIAN',
      });
      (bcrypt.compare as any).mockResolvedValue(false);
      await expect(
        service.login({ email: 'tecnico@fleet.local', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
