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
import { User } from '../../users/user.entity.js';

export enum MecanicoEstado {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity('mecanicos')
export class Mecánico {
  @ApiProperty({ example: 1, description: 'Identificador del mecánico' })
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @ApiProperty({ example: 'Juan Pérez', description: 'Nombre completo del mecánico' })
  @Column({ name: 'nombre', type: 'varchar' })
  nombre: string;

  @ApiProperty({ example: 'juan.perez@fleet.local', description: 'Correo electrónico del mecánico (único)' })
  @Column({ unique: true, name: 'email', type: 'varchar' })
  email: string;

  @ApiProperty({ example: 'Frenos', description: 'Especialidad del mecánico' })
  @Column({ name: 'especialidad', type: 'varchar' })
  especialidad: string;

  @ApiProperty({
    example: 'ACTIVE',
    enum: MecanicoEstado,
    description: 'Estado del mecánico',
  })
  @Column({
    type: 'enum',
    enum: MecanicoEstado,
    default: MecanicoEstado.ACTIVE,
    name: 'estado',
  })
  estado: MecanicoEstado;

  /**
   * Vínculo opcional con un usuario de rol TECHNICIAN.
   * Un mecánico puede estar asociado a un técnico del sistema.
   */
  @ApiProperty({
    example: 10,
    description: 'Usuario técnico asociado (opcional)',
    nullable: true,
  })
  @Column({ name: 'user_id', nullable: true, type: 'int' })
  userId: number | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @ApiHideProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiHideProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
