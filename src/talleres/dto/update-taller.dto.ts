import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { CreateTallerDto } from './create-taller.dto.js';
import { TallerEstado } from '../taller.entity.js';

export class UpdateTallerDto extends PartialType(CreateTallerDto) {
  @ApiProperty({ example: 'Taller Norte', required: false })
  nombre?: string;

  @ApiProperty({ example: 'Av. Secundaria 200', required: false })
  direccion?: string;

  @ApiProperty({ example: '555-0201', required: false })
  telefono?: string;

  @ApiProperty({ example: 'INACTIVE', enum: TallerEstado, required: false })
  estado?: TallerEstado;
}
