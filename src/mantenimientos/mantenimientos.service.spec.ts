import { Test, TestingModule } from '@nestjs/testing';
import { MantenimientosService } from './mantenimientos.service.js';
import { Mantenimiento, MantenimientoEstado, MantenimientoTipo } from './mantenimiento.entity.js';
import { Vehículo, VehiculoEstado } from '../vehículos/entities/vehículo.entity.js';
import { Mecánico, MecanicoEstado } from '../mecánicos/entities/mecánico.entity.js';
import { Taller, TallerEstado } from '../talleres/taller.entity.js';
import { DataSource } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateMantenimientoDto } from './dto/create-mantenimiento.dto.js';
import { UpdateMantenimientoDto } from './dto/update-mantenimiento.dto.js';
import { ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';

describe('MantenimientosService', () => {
  let service: MantenimientosService;
  let mantenimientoRepository: any;
  let vehiculoRepository: any;
  let mecanicoRepository: any;
  let tallerRepository: any;
  let dataSource: any;
  let manager: any;

  const fechaInicio = '2026-01-05T09:00:00Z';
  const fechaFin = '2026-01-05T11:00:00Z';

  const dto: CreateMantenimientoDto = {
    vehiculoId: 10,
    mecanicoId: 20,
    tallerId: 30,
    tipo: MantenimientoTipo.PREVENTIVE,
    descripcion: 'Cambio de aceite',
    kilometraje: 45000,
    scheduledStart: fechaInicio,
    scheduledEnd: fechaFin,
  };

  const pending = (overrides: any = {}) =>
    ({
      id: 1,
      estado: MantenimientoEstado.SCHEDULED,
      scheduledStart: new Date(fechaInicio),
      scheduledEnd: new Date(fechaFin),
      vehiculo: { id: 10, estado: VehiculoEstado.AVAILABLE, kilometraje: 44000 },
      mecanico: { id: 20, estado: MecanicoEstado.ACTIVE, userId: 100 },
      taller: { id: 30, estado: TallerEstado.ACTIVE },
      ...overrides,
    } as Mantenimiento);

  beforeEach(async () => {
    manager = {
      findOne: vi.fn(),
      save: vi.fn(),
      update: vi.fn(),
    };
    dataSource = {
      transaction: vi.fn(async (callback: any) => callback(manager)),
    };
    mantenimientoRepository = {
      findOne: vi.fn(),
      find: vi.fn(),
      create: vi.fn(),
      save: vi.fn(),
    };
    vehiculoRepository = { findOneBy: vi.fn() };
    mecanicoRepository = { findOneBy: vi.fn() };
    tallerRepository = { findOneBy: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MantenimientosService,
        { provide: getRepositoryToken(Mantenimiento), useValue: mantenimientoRepository },
        { provide: getRepositoryToken(Vehículo), useValue: vehiculoRepository },
        { provide: getRepositoryToken(Mecánico), useValue: mecanicoRepository },
        { provide: getRepositoryToken(Taller), useValue: tallerRepository },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get<MantenimientosService>(MantenimientosService);
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    beforeEach(() => {
      vehiculoRepository.findOneBy.mockResolvedValue({ id: 10, estado: VehiculoEstado.AVAILABLE, kilometraje: 44000 });
      mecanicoRepository.findOneBy.mockResolvedValue({ id: 20, estado: MecanicoEstado.ACTIVE });
      tallerRepository.findOneBy.mockResolvedValue({ id: 30, estado: TallerEstado.ACTIVE });
      mantenimientoRepository.findOne.mockResolvedValue(null);
      mantenimientoRepository.find.mockResolvedValue([]);
      mantenimientoRepository.create.mockImplementation((entity: any) => entity);
      mantenimientoRepository.save.mockResolvedValue({ id: 1, ...dto, estado: MantenimientoEstado.SCHEDULED });
    });

    it('should create a SCHEDULED maintenance', async () => {
      const result = await service.create(dto);
      expect(result.estado).toBe(MantenimientoEstado.SCHEDULED);
      expect(mantenimientoRepository.save).toHaveBeenCalled();
    });

    it('should reject when vehicle does not exist', async () => {
      vehiculoRepository.findOneBy.mockResolvedValue(null);
      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });

    it('should reject an INACTIVE vehicle', async () => {
      vehiculoRepository.findOneBy.mockResolvedValue({ id: 10, estado: VehiculoEstado.INACTIVE, kilometraje: 44000 });
      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });

    it('should reject when mechanic does not exist', async () => {
      mecanicoRepository.findOneBy.mockResolvedValue(null);
      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });

    it('should reject kilometraje lower than vehicle current', async () => {
      vehiculoRepository.findOneBy.mockResolvedValue({ id: 10, estado: VehiculoEstado.AVAILABLE, kilometraje: 50000 });
      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });

    it('should reject second active maintenance for same vehicle', async () => {
      mantenimientoRepository.findOne.mockResolvedValue(pending());
      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });

    it('should reject overlapping schedules for same mechanic', async () => {
      mantenimientoRepository.findOne.mockResolvedValue(null);
      mantenimientoRepository.find.mockResolvedValue([
        pending({ id: 2, scheduledStart: new Date('2026-01-05T09:30:00Z'), scheduledEnd: new Date('2026-01-05T10:30:00Z') }),
      ]);
      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });

    it('should allow non-overlapping schedules for same mechanic', async () => {
      mantenimientoRepository.findOne.mockResolvedValue(null);
      mantenimientoRepository.find.mockResolvedValue([
        pending({ id: 2, scheduledStart: new Date('2026-01-05T12:00:00Z'), scheduledEnd: new Date('2026-01-05T13:00:00Z') }),
      ]);
      const result = await service.create(dto);
      expect(result.estado).toBe(MantenimientoEstado.SCHEDULED);
    });
  });

  describe('cambiarEstado', () => {
    it('should transition SCHEDULED -> IN_PROGRESS and mark vehicle IN_MAINTENANCE', async () => {
      const m = pending();
      dataSource.transaction.mockImplementation(async (callback: any) => callback(manager));
      manager.findOne.mockResolvedValue(m);
      manager.save.mockResolvedValue(m);
      manager.findOne.mockResolvedValueOnce(m).mockResolvedValue({ ...m, estado: MantenimientoEstado.IN_PROGRESS });

      const result = await service.cambiarEstado(1, { estado: MantenimientoEstado.IN_PROGRESS } as UpdateMantenimientoDto, { userId: 100, roles: ['ADMIN'] });

      expect(result.estado).toBe(MantenimientoEstado.IN_PROGRESS);
    });

    it('should throw if maintenance does not exist', async () => {
      manager.findOne.mockResolvedValue(null);
      await expect(
        service.cambiarEstado(1, { estado: MantenimientoEstado.IN_PROGRESS } as UpdateMantenimientoDto, { userId: 100, roles: ['ADMIN'] }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should require final fields when completing', async () => {
      const m = pending();
      m.estado = MantenimientoEstado.IN_PROGRESS;
      dataSource.transaction.mockImplementation(async (callback: any) => callback(manager));
      manager.findOne.mockResolvedValue(m);

      await expect(
        service.cambiarEstado(1, { estado: MantenimientoEstado.COMPLETED } as UpdateMantenimientoDto, { userId: 100, roles: ['ADMIN'] }),
      ).rejects.toThrow(ConflictException);
    });

    it('should complete and restore vehicle to AVAILABLE', async () => {
      const m = pending();
      m.estado = MantenimientoEstado.IN_PROGRESS;
      dataSource.transaction.mockImplementation(async (callback: any) => callback(manager));
      manager.findOne.mockResolvedValue(m);
      manager.save.mockResolvedValue(m);

      const result = await service.cambiarEstado(1, {
        estado: MantenimientoEstado.COMPLETED,
        workDone: 'hecho',
        finalCost: 120.5,
        finishedAt: '2026-01-05T11:00:00Z',
        finalMileage: 45200,
      } as UpdateMantenimientoDto, { userId: 100, roles: ['ADMIN'] });

      expect(result.estado).toBe(MantenimientoEstado.COMPLETED);
    });

    it('should cancel an IN_PROGRESS maintenance and restore vehicle', async () => {
      const m = pending();
      m.estado = MantenimientoEstado.IN_PROGRESS;
      dataSource.transaction.mockImplementation(async (callback: any) => callback(manager));
      manager.findOne.mockResolvedValue(m);
      manager.save.mockResolvedValue(m);

      const result = await service.cambiarEstado(1, { estado: MantenimientoEstado.CANCELLED } as UpdateMantenimientoDto, { userId: 100, roles: ['ADMIN'] });

      expect(result.estado).toBe(MantenimientoEstado.CANCELLED);
    });

    it('should reject SCHEDULED -> COMPLETED', async () => {
      const m = pending();
      m.estado = MantenimientoEstado.SCHEDULED;
      dataSource.transaction.mockImplementation(async (callback: any) => callback(manager));
      manager.findOne.mockResolvedValue(m);

      await expect(
        service.cambiarEstado(1, { estado: MantenimientoEstado.COMPLETED } as UpdateMantenimientoDto, { userId: 100, roles: ['ADMIN'] }),
      ).rejects.toThrow(ConflictException);
    });

    it('should reject CANCELLED -> IN_PROGRESS', async () => {
      const m = pending();
      m.estado = MantenimientoEstado.CANCELLED;
      dataSource.transaction.mockImplementation(async (callback: any) => callback(manager));
      manager.findOne.mockResolvedValue(m);

      await expect(
        service.cambiarEstado(1, { estado: MantenimientoEstado.IN_PROGRESS } as UpdateMantenimientoDto, { userId: 100, roles: ['ADMIN'] }),
      ).rejects.toThrow(ConflictException);
    });

    it('should forbid a technician from updating another mechanic maintenance', async () => {
      const m = pending();
      m.mecanico.userId = 999;
      const mecanicoOtro = { ...m.mecanico, userId: 999 };
      dataSource.transaction.mockImplementation(async (callback: any) => callback(manager));
      manager.findOne.mockResolvedValueOnce(m).mockResolvedValue(mecanicoOtro);

      await expect(
        service.cambiarEstado(1, { estado: MantenimientoEstado.CANCELLED } as UpdateMantenimientoDto, { userId: 100, roles: ['TECHNICIAN'] }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow a technician to update his own mechanic maintenance', async () => {
      const m = pending();
      m.mecanico.userId = 100;
      const mecanicoPropio = { ...m.mecanico, userId: 100 };
      dataSource.transaction.mockImplementation(async (callback: any) => callback(manager));
      manager.findOne.mockImplementation((model: any) => {
        if (model === Mantenimiento) {
          return Promise.resolve(m);
        }
        if (model === Mecánico) {
          return Promise.resolve(mecanicoPropio);
        }
        return Promise.resolve(null);
      });
      manager.save.mockResolvedValue(m);

      const result = await service.cambiarEstado(1, { estado: MantenimientoEstado.CANCELLED } as UpdateMantenimientoDto, { userId: 100, roles: ['TECHNICIAN'] });
      expect(result.estado).toBe(MantenimientoEstado.CANCELLED);
    });
  });
});
