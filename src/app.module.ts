import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { fleetConfig } from './config/configuration.js';
import { VehículosModule } from './vehículos/vehículos.module.js';
import { MecánicosModule } from './mecánicos/mecánicos.module.js';
import { UsersModule } from './users/users.module.js';
import { AuthModule } from './auth/auth.module.js';
import { TalleresModule } from './talleres/talleres.module.js';
import { MantenimientosModule } from './mantenimientos/mantenimientos.module.js';
import { IntegrationsModule } from './integrations/integrations.module.js';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard.js';
import { RolesGuard } from './common/guards/roles.guard.js';
import { TransformInterceptor } from './common/interceptors/transform.interceptor.js';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      load: [fleetConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('fleet.database.host'),
        port: config.get<number>('fleet.database.port'),
        username: config.get<string>('fleet.database.username'),
        password: config.get<string>('fleet.database.password'),
        database: config.get<string>('fleet.database.database'),
        // Sincronización del esquema solo en entornos locales (no producción).
        synchronize: config.get<string>('fleet.nodeEnv') !== 'production',
        // Espera/reintento para no fallar si PostgreSQL aún no está listo.
        retryAttempts: 10,
        retryDelay: 3000,
        autoLoadEntities: true,
      }),
    }),
    VehículosModule,
    MecánicosModule,
    UsersModule,
    AuthModule,
    TalleresModule,
    MantenimientosModule,
    IntegrationsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Guards globales: toda ruta requiere autenticación salvo que use @Public().
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    // Interceptor y filtro de respuestas globales.
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule {}
