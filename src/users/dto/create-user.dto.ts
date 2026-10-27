import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '../user.entity.js';

export class CreateUserDto {
  @ApiProperty({ example: 'nuevo@fleet.local', description: 'Correo electrónico' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'NuevaPass123!', description: 'Contraseña (mínimo 8 caracteres)' })
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'TECHNICIAN', enum: UserRole, description: 'Rol', required: false })
  @IsOptional()
  @IsIn(Object.values(UserRole))
  role?: UserRole;
}
