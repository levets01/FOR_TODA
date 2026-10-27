import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';

// Las pruebas e2e no se conectan a PostgreSQL real; se mockea el DataSource.
// Las variables de entorno se definen aquí para que el módulo de JWT tenga
// un secreto válido sin depender de un archivo .env.
process.env.JWT_SECRET = 'e2e-test-secret-do-not-use-in-production';
process.env.JWT_EXPIRES_IN = '15m';

const mockDataSource = {
  initialize: vi.fn().mockResolvedValue(undefined),
  entityMetadatas: [],
  getRepository: vi.fn(() => ({})),
  createQueryBuilder: vi.fn(() => ({})),
  transaction: vi.fn(async (callback: any) => callback({})),
  isInitialized: true,
  driver: {} as any,
  options: {} as any,
  name: 'default',
  metadata: [],
  getMetadata: vi.fn(),
  hasMetadata: vi.fn(),
  addSubscriber: vi.fn(),
  removeSubscriber: vi.fn(),
} as unknown as DataSource;

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      // Las pruebas e2e no deben conectarse a PostgreSQL de desarrollo.
      .overrideProvider(DataSource)
      .useValue(mockDataSource)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  it('/api (GET)', async () => {
    const response = await request(app.getHttpServer()).get('/api');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.statusCode).toBe(200);
    expect(response.body.data).toBe('Hello World!');
  });

  afterEach(async () => {
    await app.close();
  });
});
