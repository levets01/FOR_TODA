import 'reflect-metadata';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../users/user.entity.js';
import { Vehículo, VehiculoEstado } from '../vehículos/entities/vehículo.entity.js';
import { Mecánico, MecanicoEstado } from '../mecánicos/entities/mecánico.entity.js';
import { Taller, TallerEstado } from '../talleres/taller.entity.js';
import { Mantenimiento, MantenimientoEstado, MantenimientoTipo } from '../mantenimientos/mantenimiento.entity.js';

function loadDotEnv(): void {
  const envPath = resolve(process.cwd(), '.env');
  try {
    const file = readFileSync(envPath, 'utf8');
    for (const line of file.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) {
        continue;
      }
      const [key, ...rest] = trimmed.split('=');
      const value = rest.join('=').trim();
      if (!(key in process.env)) {
        process.env[key] = value.replace(/^['"]|['"]$/g, '');
      }
    }
  } catch {
    // El archivo .env es opcional en algunos entornos; no rompemos el seed.
  }
}

const SEED_USERS = [
  { email: 'admin@fleet.local', password: 'Admin123!', role: UserRole.ADMIN },
  { email: 'tecnico1@fleet.local', password: 'Tecnico123!', role: UserRole.TECHNICIAN },
  { email: 'tecnico2@fleet.local', password: 'Tecnico123!', role: UserRole.TECHNICIAN },
];

const SEED_VEHICULOS = [
  { placa: 'ABC-1234', marca: 'Toyota', modelo: 'Corolla', anio: 2022, kilometraje: 45000, estado: VehiculoEstado.AVAILABLE },
  { placa: 'XYZ-5678', marca: 'Honda', modelo: 'Civic', anio: 2021, kilometraje: 38000, estado: VehiculoEstado.AVAILABLE },
  { placa: 'DEF-9012', marca: 'Ford', modelo: 'Focus', anio: 2020, kilometraje: 60000, estado: VehiculoEstado.IN_MAINTENANCE },
  { placa: 'GHI-3456', marca: 'Chevrolet', modelo: 'Spark', anio: 2019, kilometraje: 72000, estado: VehiculoEstado.INACTIVE },
];

const SEED_MECANICOS = [
  { nombre: 'Juan Pérez', email: 'juan.perez@fleet.local', especialidad: 'Frenos', estado: MecanicoEstado.ACTIVE, userIndex: 1 },
  { nombre: 'María García', email: 'maria.garcia@fleet.local', especialidad: 'Electricidad', estado: MecanicoEstado.ACTIVE, userIndex: 2 },
  { nombre: 'Carlos López', email: 'carlos.lopez@fleet.local', especialidad: 'Motor', estado: MecanicoEstado.INACTIVE, userIndex: null },
];

const SEED_TALLERES = [
  { nombre: 'Taller Central', direccion: 'Av. Principal 100', estado: TallerEstado.ACTIVE },
  { nombre: 'Taller Norte', direccion: 'Av. Secundaria 200', estado: TallerEstado.INACTIVE },
];

async function main() {
  loadDotEnv();
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USERNAME ?? 'fleet',
    password: process.env.DB_PASSWORD ?? 'fleetpass',
    database: process.env.DB_DATABASE ?? 'fleetcore',
    entities: [User, Vehículo, Mecánico, Taller, Mantenimiento],
    synchronize: true,
  });

  await dataSource.initialize();
  try {
    const userRepo = dataSource.getRepository(User);
    const users: User[] = [];
    for (const seed of SEED_USERS) {
      const existing = await userRepo.findOneBy({ email: seed.email });
      if (existing) {
        console.log(`Usuario ya existente, omitido: ${seed.email}`);
        users.push(existing);
        continue;
      }
      const passwordHash = await bcrypt.hash(seed.password, 10);
      const user = userRepo.create({ email: seed.email, password: passwordHash, role: seed.role });
      const saved = await userRepo.save(user);
      users.push(saved);
      console.log(`Usuario creado: ${seed.email} (${seed.role})`);
    }

    const vehiculoRepo = dataSource.getRepository(Vehículo);
    const vehiculos: Vehículo[] = [];
    for (const seed of SEED_VEHICULOS) {
      const existing = await vehiculoRepo.findOneBy({ placa: seed.placa });
      if (existing) {
        console.log(`Vehículo ya existente, omitido: ${seed.placa}`);
        vehiculos.push(existing);
        continue;
      }
      const saved = await vehiculoRepo.save(vehiculoRepo.create(seed));
      vehiculos.push(saved);
      console.log(`Vehículo creado: ${seed.placa}`);
    }

    const mecanicoRepo = dataSource.getRepository(Mecánico);
    const mecanicos: Mecánico[] = [];
    for (const seed of SEED_MECANICOS) {
      const existing = await mecanicoRepo.findOneBy({ email: seed.email });
      if (existing) {
        console.log(`Mecánico ya existente, omitido: ${seed.email}`);
        mecanicos.push(existing);
        continue;
      }
      const user = seed.userIndex !== null ? users[seed.userIndex] : null;
      const saved = await mecanicoRepo.save(mecanicoRepo.create({
        nombre: seed.nombre,
        email: seed.email,
        especialidad: seed.especialidad,
        estado: seed.estado,
        user: user ?? undefined,
        userId: user?.id ?? null,
      }));
      mecanicos.push(saved);
      console.log(`Mecánico creado: ${seed.nombre}`);
    }

    const tallerRepo = dataSource.getRepository(Taller);
    const talleres: Taller[] = [];
    for (const seed of SEED_TALLERES) {
      const existing = await tallerRepo.findOneBy({ nombre: seed.nombre });
      if (existing) {
        console.log(`Taller ya existente, omitido: ${seed.nombre}`);
        talleres.push(existing);
        continue;
      }
      const saved = await tallerRepo.save(tallerRepo.create(seed));
      talleres.push(saved);
      console.log(`Taller creado: ${seed.nombre}`);
    }

    const mantenimientoRepo = dataSource.getRepository(Mantenimiento);

    // Mantenimiento IN_PROGRESS para el vehículo IN_MAINTENANCE (DEF-9012) con mecánico activo Juan Pérez
    const vehiculoMantenimiento = vehiculos.find((v) => v.placa === 'DEF-9012');
    const mecanicoActivo = mecanicos.find((m) => m.email === 'juan.perez@fleet.local');
    const tallerActivo = talleres.find((t) => t.nombre === 'Taller Central');

    if (vehiculoMantenimiento && mecanicoActivo && tallerActivo) {
      const existing = await mantenimientoRepo.findOne({
        where: { vehiculo: { id: vehiculoMantenimiento.id }, estado: MantenimientoEstado.IN_PROGRESS },
      });
      if (!existing) {
        const inicio = new Date('2026-01-05T09:00:00.000Z');
        const fin = new Date('2026-01-05T11:00:00.000Z');
        const m = mantenimientoRepo.create({
          vehiculo: { id: vehiculoMantenimiento.id },
          mecanico: { id: mecanicoActivo.id },
          taller: { id: tallerActivo.id },
          tipo: MantenimientoTipo.CORRECTIVE,
          descripcion: 'Cambio de frenos delanteros',
          kilometraje: 60000,
          scheduledStart: inicio,
          scheduledEnd: fin,
          estado: MantenimientoEstado.IN_PROGRESS,
        });
        await mantenimientoRepo.save(m);
        console.log('Mantenimiento IN_PROGRESS creado para DEF-9012');
      }
    }

    // Mantenimiento COMPLETED para el vehículo ABC-1234 con mecánico María García
    const vehiculoCompletado = vehiculos.find((v) => v.placa === 'ABC-1234');
    const mecanico2 = mecanicos.find((m) => m.email === 'maria.garcia@fleet.local');
    if (vehiculoCompletado && mecanico2 && tallerActivo) {
      const existing = await mantenimientoRepo.findOne({
        where: { vehiculo: { id: vehiculoCompletado.id }, estado: MantenimientoEstado.COMPLETED },
      });
      if (!existing) {
        const m = mantenimientoRepo.create({
          vehiculo: { id: vehiculoCompletado.id },
          mecanico: { id: mecanico2.id },
          taller: { id: tallerActivo.id },
          tipo: MantenimientoTipo.PREVENTIVE,
          descripcion: 'Cambio de aceite y filtros',
          kilometraje: 45000,
          scheduledStart: new Date('2026-01-03T08:00:00.000Z'),
          scheduledEnd: new Date('2026-01-03T10:00:00.000Z'),
          estado: MantenimientoEstado.COMPLETED,
          workDone: 'Se cambió aceite y filtros de aire y aceite.',
          finalCost: 85.5,
          finishedAt: new Date('2026-01-03T09:45:00.000Z'),
          finalMileage: 45100,
        });
        await mantenimientoRepo.save(m);
        console.log('Mantenimiento COMPLETED creado para ABC-1234');
      }
    }

    console.log('Seed completado.');
  } finally {
    await dataSource.destroy();
  }
}

void main();
