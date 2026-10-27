import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { CreateVehículoDto } from './create-vehículo.dto.js';
import { VehiculoEstado } from '../entities/vehículo.entity.js';

export class UpdateVehículoDto extends PartialType(CreateVehículoDto) {
  @ApiProperty({ example: 'DEF-5678', description: 'Nueva placa del vehículo', required: false })
  placa?: string;

  @ApiProperty({ example: 'Ford', description: 'Nueva marca', required: false })
  marca?: string;

  @ApiProperty({ example: 'Focus', description: 'Nuevo modelo', required: false })
  modelo?: string;

  @ApiProperty({ example: 2023, description: 'Nuevo año', required: false })
  anio?: number;

  @ApiProperty({ example: 46000, description: 'Nuevo kilometraje', required: false })
  kilometraje?: number;

  @ApiProperty({ example: 'IN_MAINTENANCE', enum: VehiculoEstado, description: 'Nuevo estado', required: false })
  estado?: VehiculoEstado;
}
