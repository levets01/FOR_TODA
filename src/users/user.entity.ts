import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  ADMIN = 'ADMIN',
  TECHNICIAN = 'TECHNICIAN',
}

@Entity('users')
export class User {
  @ApiProperty({ example: 1, description: 'Identificador del usuario' })
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @ApiProperty({ example: 'admin@fleet.local', description: 'Correo electrónico del usuario (único)' })
  @Column({ unique: true, name: 'email', type: 'varchar' })
  email: string;

  @ApiHideProperty()
  @Column({ name: 'password', type: 'varchar' })
  password: string;

  @ApiProperty({ example: 'ADMIN', enum: UserRole, description: 'Rol del usuario' })
  @Column({ type: 'enum', enum: UserRole, default: UserRole.TECHNICIAN })
  role: UserRole;

  @ApiHideProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiHideProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
