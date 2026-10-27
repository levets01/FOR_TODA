import {
  ConflictException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { CreateMantenimientoDto } from './dto/create-mantenimiento.dto.js';
import { UpdateMantenimientoDto } from './dto/update-mantenimiento.dto.js';
import { Mantenimiento, MantenimientoEstado } from './mantenimiento.entity.js';
import { Vehículo, VehiculoEstado } from '../vehículos/entities/vehículo.entity.js';
import { Mecánico, MecanicoEstado } from '../mecánicos/entities/mecánico.entity.js';
import { Taller, TallerEstado } from '../talleres/taller.entity.js';

const ESTADOS_ACTIVOS = [MantenimientoEstado.SCHEDULED, MantenimientoEstado.IN_PROGRESS];

/**
 * Transiciones válidas de estado:
 * SCHEDULED -> IN_PROGRESS | CANCELLED
 * IN_PROGRESS -> COMPLETED | CANCELLED
 * COMPLETED -> (no retrocede)
 * CANCELLED -> (no pasa a IN_PROGRESS ni COMPLETED)
 */
const TRANSICIONES_VALIDAS: Record<MantenimientoEstado, MantenimientoEstado[]> = {
  [MantenimientoEstado.SCHEDULED]: [MantenimientoEstado.IN_PROGRESS, MantenimientoEstado.CANCELLED],
  [MantenimientoEstado.IN_PROGRESS]: [MantenimientoEstado.COMPLETED, MantenimientoEstado.CANCELLED],
  [MantenimientoEstado.COMPLETED]: [],
  [MantenimientoEstado.CANCELLED]: [],
};

@Injectable()
export class MantenimientosService {
  constructor(
    @InjectRepository(Mantenimiento)
    private readonly mantenimientosRepository: Repository<Mantenimiento>,
    @InjectRepository(Vehículo)
    private readonly vehiculosRepository: Repository<Vehículo>,
    @InjectRepository(Mecánico)
    private readonly mecanicosRepository: Repository<Mecánico>,
    @InjectRepository(Taller)
    private readonly talleresRepository: Repository<Taller>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async create(createMantenimientoDto: CreateMantenimientoDto): Promise<Mantenimiento> {
    const {
      vehiculoId,
      mecanicoId,
      tallerId,
      tipo,
      descripcion,
      kilometraje,
      scheduledStart,
      scheduledEnd,
      estado,
    } = createMantenimientoDto;

    const vehiculo = await this.vehiculosRepository.findOneBy({ id: vehiculoId });
    if (!vehiculo) {
      throw new NotFoundException(`Vehículo con id ${vehiculoId} no encontrado`);
    }
    if (vehiculo.estado === VehiculoEstado.INACTIVE) {
      throw new ConflictException('No se puede asociar un vehículo INACTIVE a un mantenimiento');
    }

    const mecanico = await this.mecanicosRepository.findOneBy({ id: mecanicoId });
    if (!mecanico) {
      throw new NotFoundException(`Mecánico con id ${mecanicoId} no encontrado`);
    }
    if (mecanico.estado === MecanicoEstado.INACTIVE) {
      throw new ConflictException('El mecánico está inactivo');
    }

    let taller: Taller | null = null;
    if (tallerId) {
      taller = await this.talleresRepository.findOneBy({ id: tallerId });
      if (!taller) {
        throw new NotFoundException(`Taller con id ${tallerId} no encontrado`);
      }
      if (taller.estado === TallerEstado.INACTIVE) {
        throw new ConflictException('El taller está inactivo');
      }
    }

    if (kilometraje < vehiculo.kilometraje) {
      throw new ConflictException(
        `El kilometraje (${kilometraje}) no puede ser inferior al actual del vehículo (${vehiculo.kilometraje})`,
      );
    }

    const inicio = new Date(scheduledStart);
    const fin = scheduledEnd ? new Date(scheduledEnd) : null;

    // Un vehículo no puede tener más de un mantenimiento activo
    const activoVehiculo = await this.mantenimientosRepository.findOne({
      where: { vehiculo: { id: vehiculoId }, estado: In(ESTADOS_ACTIVOS) },
    });
    if (activoVehiculo) {
      throw new ConflictException('El vehículo ya tiene un mantenimiento activo');
    }

    // Un mecánico no puede tener mantenimientos activos con horarios cruzados
    const activosMecanico = await this.mantenimientosRepository.find({
      where: { mecanico: { id: mecanicoId }, estado: In(ESTADOS_ACTIVOS) },
    });
    const conflicto = activosMecanico.some((m) =>
      this.intervalosSeSolapan(m.scheduledStart, m.scheduledEnd, inicio, fin),
    );
    if (conflicto) {
      throw new ConflictException(
        `El mecánico ${mecanico.nombre} ya tiene un mantenimiento en ese horario`,
      );
    }

    const data = {
      vehiculo: { id: vehiculoId },
      mecanico: { id: mecanicoId },
      ...(taller ? { taller: { id: tallerId } } : {}),
      tipo,
      descripcion,
      kilometraje,
      scheduledStart: inicio,
      scheduledEnd: fin,
      estado: estado ?? MantenimientoEstado.SCHEDULED,
    };

    const mantenimiento = this.mantenimientosRepository.create(data);
    return this.mantenimientosRepository.save(mantenimiento);
  }

  private intervalosSeSolapan(
    inicioA: Date,
    finA: Date | null,
    inicioB: Date,
    finB: Date | null,
  ): boolean {
    const finAOpen = finA === null ? Infinity : finA.getTime();
    const finBOpen = finB === null ? Infinity : finB.getTime();
    return inicioA.getTime() < finBOpen && finAOpen > inicioB.getTime();
  }

  async findAll(user?: { userId: number; roles: string[] }): Promise<Mantenimiento[]> {
    const qb = this.mantenimientosRepository.createQueryBuilder('m')
      .leftJoinAndSelect('m.vehiculo', 'v')
      .leftJoinAndSelect('m.mecanico', 'mec')
      .leftJoinAndSelect('m.taller', 't')
      .orderBy('m.id', 'DESC');

    // Un TECHNICIAN solo ve los mantenimientos de su mecánico
    if (user && !user.roles.includes('ADMIN')) {
      qb.andWhere('mec.userId = :userId', { userId: user.userId });
    }

    return qb.getMany();
  }

  async findActivos(user?: { userId: number; roles: string[] }): Promise<Mantenimiento[]> {
    const qb = this.mantenimientosRepository.createQueryBuilder('m')
      .leftJoinAndSelect('m.vehiculo', 'v')
      .leftJoinAndSelect('m.mecanico', 'mec')
      .leftJoinAndSelect('m.taller', 't')
      .where('m.estado IN (:...estados)', { estados: ESTADOS_ACTIVOS })
      .orderBy('m.id', 'DESC');

    if (user && !user.roles.includes('ADMIN')) {
      qb.andWhere('mec.userId = :userId', { userId: user.userId });
    }

    return qb.getMany();
  }

  async findByVehiculo(vehiculoId: number, user?: { userId: number; roles: string[] }): Promise<Mantenimiento[]> {
    const qb = this.mantenimientosRepository.createQueryBuilder('m')
      .leftJoinAndSelect('m.vehiculo', 'v')
      .leftJoinAndSelect('m.mecanico', 'mec')
      .leftJoinAndSelect('m.taller', 't')
      .where('m.vehiculo = :vehiculoId', { vehiculoId })
      .orderBy('m.scheduledStart', 'ASC');

    if (user && !user.roles.includes('ADMIN')) {
      qb.andWhere('mec.userId = :userId', { userId: user.userId });
    }

    return qb.getMany();
  }

  async findByMecanico(mecanicoId: number, user?: { userId: number; roles: string[] }): Promise<Mantenimiento[]> {
    // Un TECHNICIAN solo puede consultar sus propios mantenimientos
    if (user && !user.roles.includes('ADMIN') && user.userId !== undefined) {
      const mecanico = await this.mecanicosRepository.findOneBy({ id: mecanicoId });
      if (!mecanico || mecanico.userId !== user.userId) {
        throw new ForbiddenException('No tienes permiso para ver los mantenimientos de este mecánico');
      }
    }

    return this.mantenimientosRepository.find({
      where: { mecanico: { id: mecanicoId } },
      relations: { vehiculo: true, mecanico: true, taller: true },
      order: { scheduledStart: 'ASC' },
    });
  }

  async findOne(id: number, user?: { userId: number; roles: string[] }): Promise<Mantenimiento> {
    const qb = this.mantenimientosRepository.createQueryBuilder('m')
      .leftJoinAndSelect('m.vehiculo', 'v')
      .leftJoinAndSelect('m.mecanico', 'mec')
      .leftJoinAndSelect('m.taller', 't')
      .where('m.id = :id', { id });

    if (user && !user.roles.includes('ADMIN')) {
      qb.andWhere('mec.userId = :userId', { userId: user.userId });
    }

    const mantenimiento = await qb.getOne();
    if (!mantenimiento) {
      throw new NotFoundException(`Mantenimiento con id ${id} no encontrado`);
    }
    return mantenimiento;
  }

  async cambiarEstado(
    id: number,
    updateMantenimientoDto: UpdateMantenimientoDto,
    user?: { userId: number; roles: string[] },
  ): Promise<Mantenimiento> {
    return this.dataSource.transaction(async (manager) => {
      const mantenimiento = await manager.findOne(Mantenimiento, {
        where: { id },
        relations: { vehiculo: true, mecanico: true },
      });
      if (!mantenimiento) {
        throw new NotFoundException(`Mantenimiento con id ${id} no encontrado`);
      }

      // Un TECHNICIAN solo puede actualizar mantenimientos de su mecánico
      if (user && !user.roles.includes('ADMIN')) {
        const mecanico = await manager.findOne(Mecánico, {
          where: { id: mantenimiento.mecanico.id },
        });
        if (!mecanico || mecanico.userId !== user.userId) {
          throw new ForbiddenException('No tienes permiso para actualizar este mantenimiento');
        }
      }

      const nuevoEstado = updateMantenimientoDto.estado;
      if (!nuevoEstado) {
        throw new ConflictException('Se requiere un nuevo estado');
      }

      const transicionesPermitidas = TRANSICIONES_VALIDAS[mantenimiento.estado];
      if (!transicionesPermitidas.includes(nuevoEstado)) {
        throw new ConflictException(
          `Transición no permitida: ${mantenimiento.estado} → ${nuevoEstado}`,
        );
      }

      // Si se completa, exigir campos finales
      if (nuevoEstado === MantenimientoEstado.COMPLETED) {
        if (!updateMantenimientoDto.workDone) {
          throw new ConflictException('Para completar se requiere workDone');
        }
        if (updateMantenimientoDto.finalCost === undefined) {
          throw new ConflictException('Para completar se requiere finalCost');
        }
        if (!updateMantenimientoDto.finishedAt) {
          throw new ConflictException('Para completar se requiere finishedAt');
        }
        if (updateMantenimientoDto.finalMileage === undefined) {
          throw new ConflictException('Para completar se requiere finalMileage');
        }

        mantenimiento.workDone = updateMantenimientoDto.workDone;
        mantenimiento.finalCost = updateMantenimientoDto.finalCost;
        mantenimiento.finishedAt = new Date(updateMantenimientoDto.finishedAt);
        mantenimiento.finalMileage = updateMantenimientoDto.finalMileage;

        // COMPLETED devuelve vehículo a AVAILABLE
        mantenimiento.vehiculo.estado = VehiculoEstado.AVAILABLE;
        await manager.save(mantenimiento.vehiculo);
      } else if (nuevoEstado === MantenimientoEstado.IN_PROGRESS) {
        // IN_PROGRESS pone vehículo en IN_MAINTENANCE
        mantenimiento.vehiculo.estado = VehiculoEstado.IN_MAINTENANCE;
        await manager.save(mantenimiento.vehiculo);
      } else if (nuevoEstado === MantenimientoEstado.CANCELLED) {
        // Si estaba IN_PROGRESS, devolver vehículo a AVAILABLE
        if (mantenimiento.estado === MantenimientoEstado.IN_PROGRESS) {
          mantenimiento.vehiculo.estado = VehiculoEstado.AVAILABLE;
          await manager.save(mantenimiento.vehiculo);
        }
      }

      mantenimiento.estado = nuevoEstado;
      await manager.save(mantenimiento);

      const result = await manager.findOne(Mantenimiento, {
        where: { id },
        relations: { vehiculo: true, mecanico: true, taller: true },
      });
      if (!result) {
        throw new NotFoundException(`Mantenimiento con id ${id} no encontrado tras actualizar`);
      }
      return result;
    });
  }
}
