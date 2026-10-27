import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vehículo } from './entities/vehículo.entity.js';
import { VehículosService } from './vehículos.service.js';
import { VehículosController } from './vehículos.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Vehículo])],
  controllers: [VehículosController],
  providers: [VehículosService],
  exports: [VehículosService],
})
export class VehículosModule {}
