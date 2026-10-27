import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Vehículo } from '../vehículos/entities/vehículo.entity.js';
import { Mecánico } from '../mecánicos/entities/mecánico.entity.js';
import { Taller } from '../talleres/taller.entity.js';

export enum MantenimientoTipo {
  PREVENTIVE = 'PREVENTIVE',
  CORRECTIVE = 'CORRECTIVE',
}

export enum MantenimientoEstado {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity('mantenimientos')
export class Mantenimiento {
  @ApiProperty({ example: 1, description: 'Identificador del mantenimiento' })
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @ApiProperty({ example: 10, description: 'Identificador del vehículo' })
  @ManyToOne(() => Vehículo)
  @JoinColumn({ name: 'vehiculo_id' })
  vehiculo: Vehículo;

  @ApiProperty({ example: 20, description: 'Identificador del mecánico' })
  @ManyToOne(() => Mecánico)
  @JoinColumn({ name: 'mecanico_id' })
  mecanico: Mecánico;

  @ApiProperty({ example: 30, description: 'Identificador del taller', nullable: true })
  @ManyToOne(() => Taller, { nullable: true })
  @JoinColumn({ name: 'taller_id' })
  taller: Taller | null;

  @ApiProperty({
    example: 'PREVENTIVE',
    enum: MantenimientoTipo,
    description: 'Tipo de mantenimiento',
  })
  @Column({ type: 'enum', enum: MantenimientoTipo })
  tipo: MantenimientoTipo;

  @ApiProperty({
    example: 'SCHEDULED',
    enum: MantenimientoEstado,
    description: 'Estado del mantenimiento',
  })
  @Column({
    type: 'enum',
    enum: MantenimientoEstado,
    default: MantenimientoEstado.SCHEDULED,
  })
  estado: MantenimientoEstado;

  @ApiProperty({ example: 'Cambio de aceite y filtros', description: 'Descripción del mantenimiento' })
  @Column({ name: 'descripcion', type: 'text' })
  descripcion: string;

  @ApiProperty({ example: 45000, description: 'Kilometraje programado para el mantenimiento' })
  @Column({ name: 'kilometraje', type: 'int' })
  kilometraje: number;

  @ApiProperty({
    example: '2026-01-05T09:00:00.000Z',
    description: 'Fecha y hora de inicio programada',
  })
  @Column({ name: 'scheduled_start', type: 'timestamptz' })
  scheduledStart: Date;

  @ApiProperty({
    example: '2026-01-05T11:00:00.000Z',
    description: 'Fecha y hora de finalización programada',
    nullable: true,
  })
  @Column({ name: 'scheduled_end', type: 'timestamptz', nullable: true })
  scheduledEnd: Date | null;

  @ApiProperty({ example: 'Terminado sin novedades', description: 'Trabajo realizado', nullable: true })
  @Column({ name: 'work_done', type: 'text', nullable: true })
  workDone: string | null;

  @ApiProperty({ example: 120.5, description: 'Coste final del mantenimiento', nullable: true })
  @Column({ name: 'final_cost', type: 'decimal', precision: 10, scale: 2, nullable: true })
  finalCost: number | null;

  @ApiProperty({ example: '2026-01-05T11:00:00.000Z', description: 'Fecha de finalización real', nullable: true })
  @Column({ name: 'finished_at', type: 'timestamptz', nullable: true })
  finishedAt: Date | null;

  @ApiProperty({ example: 45200, description: 'Kilometraje final del vehículo', nullable: true })
  @Column({ name: 'final_mileage', type: 'int', nullable: true })
  finalMileage: number | null;

  @ApiHideProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiHideProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
