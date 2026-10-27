import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { MantenimientoEstado } from '../mantenimiento.entity.js';

export class UpdateMantenimientoDto {
  @ApiProperty({
    example: 'IN_PROGRESS',
    enum: MantenimientoEstado,
    description: 'Nuevo estado',
    required: false,
  })
  @IsOptional()
  @IsEnum(MantenimientoEstado)
  estado?: MantenimientoEstado;

  @ApiProperty({ example: 'Terminado sin novedades', description: 'Trabajo realizado', required: false })
  @IsOptional()
  @IsString()
  workDone?: string;

  @ApiProperty({ example: 120.5, description: 'Coste final', required: false })
  @IsOptional()
  @IsPositive()
  finalCost?: number;

  @ApiProperty({ example: '2026-01-05T11:00:00.000Z', description: 'Fecha de finalización real', required: false })
  @IsOptional()
  @IsDateString()
  finishedAt?: string;

  @ApiProperty({ example: 45200, description: 'Kilometraje final', required: false })
  @IsOptional()
  @IsPositive()
  finalMileage?: number;
}
