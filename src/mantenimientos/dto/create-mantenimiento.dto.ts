import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { MantenimientoEstado, MantenimientoTipo } from '../mantenimiento.entity.js';

export class CreateMantenimientoDto {
  @ApiProperty({ example: 10, description: 'Identificador del vehículo' })
  @IsInt()
  @IsNotEmpty()
  vehiculoId: number;

  @ApiProperty({ example: 20, description: 'Identificador del mecánico' })
  @IsInt()
  @IsNotEmpty()
  mecanicoId: number;

  @ApiProperty({ example: 30, description: 'Identificador del taller', required: false })
  @IsOptional()
  @IsInt()
  tallerId?: number;

  @ApiProperty({
    example: 'PREVENTIVE',
    enum: MantenimientoTipo,
    description: 'Tipo de mantenimiento',
  })
  @IsEnum(MantenimientoTipo)
  @IsNotEmpty()
  tipo: MantenimientoTipo;

  @ApiProperty({ example: 'Cambio de aceite y filtros', description: 'Descripción del mantenimiento' })
  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @ApiProperty({ example: 45000, description: 'Kilometraje programado' })
  @IsInt()
  @IsNotEmpty()
  kilometraje: number;

  @ApiProperty({
    example: '2026-01-05T09:00:00.000Z',
    description: 'Fecha y hora de inicio programada',
  })
  @IsDateString()
  @IsNotEmpty()
  scheduledStart: string;

  @ApiProperty({
    example: '2026-01-05T11:00:00.000Z',
    description: 'Fecha y hora de finalización programada',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  scheduledEnd?: string;

  @ApiProperty({
    example: 'SCHEDULED',
    enum: MantenimientoEstado,
    description: 'Estado inicial',
    required: false,
  })
  @IsOptional()
  @IsEnum(MantenimientoEstado)
  estado?: MantenimientoEstado;
}
