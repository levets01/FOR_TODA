import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'tecnico@fleet.local', description: 'Correo electrónico' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Tecnico123!', description: 'Contraseña (mínimo 8 caracteres)' })
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password: string;
}
