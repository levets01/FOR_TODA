-- database/fleetcore.sql
-- Esquema de referencia para FleetCore (PostgreSQL)
-- Se aplica automáticamente con TypeORM (synchronize) en desarrollo.

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'TECHNICIAN',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vehiculos (
  id SERIAL PRIMARY KEY,
  placa VARCHAR(50) UNIQUE NOT NULL,
  marca VARCHAR(100) NOT NULL,
  modelo VARCHAR(100) NOT NULL,
  anio INTEGER NOT NULL,
  kilometraje INTEGER NOT NULL DEFAULT 0,
  estado VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mecanicos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  especialidad VARCHAR(255) NOT NULL,
  estado VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
  user_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS talleres (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  direccion VARCHAR(255) NOT NULL,
  estado VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mantenimientos (
  id SERIAL PRIMARY KEY,
  vehiculo_id INTEGER NOT NULL REFERENCES vehiculos(id),
  mecanico_id INTEGER NOT NULL REFERENCES mecanicos(id),
  taller_id INTEGER REFERENCES talleres(id),
  tipo VARCHAR(50) NOT NULL,
  estado VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED',
  descripcion TEXT NOT NULL,
  kilometraje INTEGER NOT NULL,
  scheduled_start TIMESTAMP WITH TIME ZONE NOT NULL,
  scheduled_end TIMESTAMP WITH TIME ZONE,
  work_done TEXT,
  final_cost DECIMAL(10,2),
  finished_at TIMESTAMP WITH TIME ZONE,
  final_mileage INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Datos de prueba idempotentes (ejecutar tras crear las tablas)
-- Usuarios
INSERT INTO users (email, password, role) VALUES
  ('admin@fleet.local', '$2b$10$placeholder', 'ADMIN'),
  ('tecnico1@fleet.local', '$2b$10$placeholder', 'TECHNICIAN'),
  ('tecnico2@fleet.local', '$2b$10$placeholder', 'TECHNICIAN')
ON CONFLICT (email) DO NOTHING;

-- Mecánicos (vinculados a usuarios tecnico1 y tecnico2)
INSERT INTO mecanicos (nombre, email, especialidad, estado, user_id)
SELECT 'Juan Pérez', 'juan.perez@fleet.local', 'Frenos', 'ACTIVE', u.id
FROM users u WHERE u.email = 'tecnico1@fleet.local'
ON CONFLICT (email) DO NOTHING;

INSERT INTO mecanicos (nombre, email, especialidad, estado, user_id)
SELECT 'María García', 'maria.garcia@fleet.local', 'Electricidad', 'ACTIVE', u.id
FROM users u WHERE u.email = 'tecnico2@fleet.local'
ON CONFLICT (email) DO NOTHING;

INSERT INTO mecanicos (nombre, email, especialidad, estado, user_id)
VALUES ('Carlos López', 'carlos.lopez@fleet.local', 'Motor', 'INACTIVE', NULL)
ON CONFLICT (email) DO NOTHING;

-- Talleres
INSERT INTO talleres (nombre, direccion, estado) VALUES
  ('Taller Central', 'Av. Principal 100', 'ACTIVE'),
  ('Taller Norte', 'Av. Secundaria 200', 'INACTIVE')
ON CONFLICT (nombre) DO NOTHING;

-- Vehículos
INSERT INTO vehiculos (placa, marca, modelo, anio, kilometraje, estado) VALUES
  ('ABC-1234', 'Toyota', 'Corolla', 2022, 45000, 'AVAILABLE'),
  ('XYZ-5678', 'Honda', 'Civic', 2021, 38000, 'AVAILABLE'),
  ('DEF-9012', 'Ford', 'Focus', 2020, 60000, 'IN_MAINTENANCE'),
  ('GHI-3456', 'Chevrolet', 'Spark', 2019, 72000, 'INACTIVE')
ON CONFLICT (placa) DO NOTHING;

-- Mantenimiento IN_PROGRESS para DEF-9012
INSERT INTO mantenimientos (vehiculo_id, mecanico_id, taller_id, tipo, descripcion, kilometraje, scheduled_start, scheduled_end, estado)
SELECT v.id, m.id, t.id, 'CORRECTIVE', 'Cambio de frenos delanteros', 60000,
  '2026-01-05T09:00:00Z'::timestamptz, '2026-01-05T11:00:00Z'::timestamptz, 'IN_PROGRESS'
FROM vehiculos v, mecanicos m, talleres t
WHERE v.placa = 'DEF-9012' AND m.email = 'juan.perez@fleet.local' AND t.nombre = 'Taller Central'
ON CONFLICT DO NOTHING;

-- Mantenimiento COMPLETED para ABC-1234
INSERT INTO mantenimientos (vehiculo_id, mecanico_id, taller_id, tipo, descripcion, kilometraje, scheduled_start, scheduled_end, estado, work_done, final_cost, finished_at, final_mileage)
SELECT v.id, m.id, t.id, 'PREVENTIVE', 'Cambio de aceite y filtros', 45000,
  '2026-01-03T08:00:00Z'::timestamptz, '2026-01-03T10:00:00Z'::timestamptz, 'COMPLETED',
  'Se cambió aceite y filtros de aire y aceite.', 85.50,
  '2026-01-03T09:45:00Z'::timestamptz, 45100
FROM vehiculos v, mecanicos m, talleres t
WHERE v.placa = 'ABC-1234' AND m.email = 'maria.garcia@fleet.local' AND t.nombre = 'Taller Central'
ON CONFLICT DO NOTHING;
