import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { CreateMecánicoDto } from './create-mecánico.dto.js';
import { MecanicoEstado } from '../entities/mecánico.entity.js';

export class UpdateMecánicoDto extends PartialType(CreateMecánicoDto) {
  @ApiProperty({ example: 'Juan Pérez García', required: false })
  nombre?: string;

  @ApiProperty({ example: 'juan.perez@fleet.local', required: false })
  email?: string;

  @ApiProperty({ example: 'Electricidad', required: false })
  especialidad?: string;

  @ApiProperty({ example: 'INACTIVE', enum: MecanicoEstado, required: false })
  estado?: MecanicoEstado;
}
