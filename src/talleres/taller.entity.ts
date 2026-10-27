import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum TallerEstado {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity('talleres')
export class Taller {
  @ApiProperty({ example: 1, description: 'Identificador del taller' })
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @ApiProperty({ example: 'Taller Central', description: 'Nombre del taller' })
  @Column({ name: 'nombre', type: 'varchar' })
  nombre: string;

  @ApiProperty({ example: 'Av. Principal 100', description: 'Dirección del taller' })
  @Column({ name: 'direccion', type: 'varchar' })
  direccion: string;

  @ApiProperty({
    example: 'ACTIVE',
    enum: TallerEstado,
    description: 'Estado del taller',
  })
  @Column({
    type: 'enum',
    enum: TallerEstado,
    default: TallerEstado.ACTIVE,
    name: 'estado',
  })
  estado: TallerEstado;

  @ApiHideProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiHideProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
