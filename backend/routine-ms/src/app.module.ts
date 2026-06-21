import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { RoutinesModule } from './routines/routines.module';
import { AiEngineModule } from './ai-engine/ai-engine.module';
import { MessagingModule } from './messaging/messaging.module';
import { HealthController } from './health/health.controller';

/**
 * Module racine de l'application routine-ms.
 *
 * Orchestre :
 *   - ConfigModule    : chargement des variables d'environnement (.env)
 *   - MongooseModule  : connexion MongoDB
 *   - AiEngineModule  : moteur IA (recommandation + détection de conflits)
 *   - RoutinesModule  : CRUD routines + endpoints REST
 *   - MessagingModule : consumers/producer RabbitMQ
 *   - HealthController: GET /health
 */
@Module({
  imports: [
    // ─── Variables d'environnement ──────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // ─── Connexion MongoDB (URI depuis .env) ────────────────────
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>(
          'MONGO_URI',
          'mongodb://localhost:27017/routine-db',
        ),
      }),
      inject: [ConfigService],
    }),

    // ─── Modules métier ─────────────────────────────────────────
    AiEngineModule,
    RoutinesModule,
    MessagingModule,
  ],
  // HealthController déclaré au niveau racine (pas de sous-module dédié)
  controllers: [HealthController],
})
export class AppModule {}
