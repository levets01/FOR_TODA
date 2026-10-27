import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mantenimiento } from './mantenimiento.entity.js';
import { Vehículo } from '../vehículos/entities/vehículo.entity.js';
import { Mecánico } from '../mecánicos/entities/mecánico.entity.js';
import { Taller } from '../talleres/taller.entity.js';
import { MantenimientosService } from './mantenimientos.service.js';
import { MantenimientosController } from './mantenimientos.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Mantenimiento, Vehículo, Mecánico, Taller])],
  controllers: [MantenimientosController],
  providers: [MantenimientosService],
  exports: [MantenimientosService],
})
export class MantenimientosModule {}
