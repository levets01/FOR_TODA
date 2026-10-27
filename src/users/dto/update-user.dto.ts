import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto.js';
import { UserRole } from '../user.entity.js';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({ example: 'nuevo@fleet.local', required: false })
  email?: string;

  @ApiProperty({ example: 'NuevaPass123!', required: false })
  password?: string;

  @ApiProperty({ example: 'ADMIN', enum: UserRole, required: false })
  role?: UserRole;
}
