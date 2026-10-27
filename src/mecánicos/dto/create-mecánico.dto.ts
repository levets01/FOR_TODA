import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { MecanicoEstado } from '../entities/mecánico.entity.js';

export class CreateMecánicoDto {
  @ApiProperty({ example: 'Juan Pérez', description: 'Nombre del mecánico' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: 'juan.perez@fleet.local', description: 'Correo del mecánico' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Frenos', description: 'Especialidad del mecánico' })
  @IsString()
  @IsNotEmpty()
  especialidad: string;

  @ApiProperty({ example: 'ACTIVE', enum: MecanicoEstado, description: 'Estado', required: false })
  @IsString()
  @IsNotEmpty()
  estado: MecanicoEstado;
}
