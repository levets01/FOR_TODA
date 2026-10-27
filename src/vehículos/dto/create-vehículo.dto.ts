import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { VehiculoEstado } from '../entities/vehículo.entity.js';

export class CreateVehículoDto {
  @ApiProperty({ example: 'ABC-1234', description: 'Placa del vehículo' })
  @IsString()
  @IsNotEmpty()
  placa: string;

  @ApiProperty({ example: 'Toyota', description: 'Marca del vehículo' })
  @IsString()
  @IsNotEmpty()
  marca: string;

  @ApiProperty({ example: 'Corolla', description: 'Modelo del vehículo' })
  @IsString()
  @IsNotEmpty()
  modelo: string;

  @ApiProperty({ example: 2022, description: 'Año de fabricación' })
  @IsInt()
  @Min(1886)
  anio: number;

  @ApiProperty({ example: 45000, description: 'Kilometraje actual', required: false })
  @IsInt()
  @IsNotEmpty()
  kilometraje: number;

  @ApiProperty({ example: 'AVAILABLE', enum: VehiculoEstado, description: 'Estado', required: false })
  @IsString()
  @IsNotEmpty()
  estado: VehiculoEstado;
}
