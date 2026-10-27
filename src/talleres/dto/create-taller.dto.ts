import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { TallerEstado } from '../taller.entity.js';

export class CreateTallerDto {
  @ApiProperty({ example: 'Taller Central', description: 'Nombre del taller' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: 'Av. Principal 100', description: 'Dirección del taller' })
  @IsString()
  @IsNotEmpty()
  direccion: string;

  @ApiProperty({ example: '555-0200', description: 'Teléfono del taller' })
  @IsString()
  @IsNotEmpty()
  telefono: string;

  @ApiProperty({ example: 'ACTIVE', enum: TallerEstado, description: 'Estado', required: false })
  @IsOptional()
  @IsString()
  estado?: TallerEstado;
}
