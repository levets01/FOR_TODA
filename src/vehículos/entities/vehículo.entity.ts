import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum VehiculoEstado {
  AVAILABLE = 'AVAILABLE',
  IN_MAINTENANCE = 'IN_MAINTENANCE',
  INACTIVE = 'INACTIVE',
}

@Entity('vehiculos')
export class Vehículo {
  @ApiProperty({ example: 1, description: 'Identificador del vehículo' })
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @ApiProperty({ example: 'ABC-1234', description: 'Placa del vehículo (única)' })
  @Column({ unique: true, name: 'placa', type: 'varchar' })
  placa: string;

  @ApiProperty({ example: 'Toyota', description: 'Marca del vehículo' })
  @Column({ name: 'marca', type: 'varchar' })
  marca: string;

  @ApiProperty({ example: 'Corolla', description: 'Modelo del vehículo' })
  @Column({ name: 'modelo', type: 'varchar' })
  modelo: string;

  @ApiProperty({ example: 2022, description: 'Año de fabricación' })
  @Column({ name: 'anio', type: 'int' })
  anio: number;

  @ApiProperty({ example: 45000, description: 'Kilometraje actual del vehículo' })
  @Column({ name: 'kilometraje', type: 'int', default: 0 })
  kilometraje: number;

  @ApiProperty({
    example: 'AVAILABLE',
    enum: VehiculoEstado,
    description: 'Estado del vehículo',
  })
  @Column({
    type: 'enum',
    enum: VehiculoEstado,
    default: VehiculoEstado.AVAILABLE,
    name: 'estado',
  })
  estado: VehiculoEstado;

  @ApiHideProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiHideProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
