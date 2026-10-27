import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { RegisterDto } from '../../auth/dto/register.dto.js';
import { LoginDto } from '../../auth/dto/login.dto.js';

describe('RegisterDto validation', () => {
  it('should accept valid data', async () => {
    const dto = plainToInstance(RegisterDto, {
      email: 'usuario@fleet.local',
      password: 'Password123!',
    });
    expect(await validate(dto)).toHaveLength(0);
  });

  it('should reject invalid email and short password', async () => {
    const dto = plainToInstance(RegisterDto, { email: 'no-email', password: '123' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});

describe('LoginDto validation', () => {
  it('should accept valid credentials', async () => {
    const dto = plainToInstance(LoginDto, {
      email: 'usuario@fleet.local',
      password: 'Password123!',
    });
    expect(await validate(dto)).toHaveLength(0);
  });
});
