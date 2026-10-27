import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mecánico } from './entities/mecánico.entity.js';
import { MecánicosService } from './mecánicos.service.js';
import { MecánicosController } from './mecánicos.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Mecánico])],
  controllers: [MecánicosController],
  providers: [MecánicosService],
  exports: [MecánicosService],
})
export class MecánicosModule {}
