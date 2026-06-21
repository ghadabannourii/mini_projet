import { Module, forwardRef } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConflictProducerService } from './conflict-producer.service';
import { AnalyseConsumerService } from './analyse-consumer.service';
import { ProfilConsumerService } from './profil-consumer.service';
import { RoutinesModule } from '../routines/routines.module';
import { getRabbitMQConfig } from '../config/rabbitmq.config';

/**
 * Module de messagerie asynchrone (RabbitMQ).
 *
 * Enregistre :
 *   - RabbitMQModule (@golevelup/nestjs-rabbitmq) avec la config dynamique
 *   - ConflictProducerService  : publie dans conflit_detecte_queue
 *   - AnalyseConsumerService   : consomme analyse_terminee_queue
 *   - ProfilConsumerService    : consomme profil_maj_queue
 *
 * forwardRef résout la dépendance circulaire :
 *   RoutinesModule → MessagingModule → RoutinesModule
 */
@Module({
  imports: [
    // Configuration RabbitMQ chargée depuis les variables d'environnement
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      imports: [ConfigModule],
      useFactory: () => getRabbitMQConfig(),
      inject: [ConfigService],
    }),
    // forwardRef casse la dépendance circulaire
    forwardRef(() => RoutinesModule),
  ],
  providers: [
    ConflictProducerService,
    AnalyseConsumerService,
    ProfilConsumerService,
  ],
  exports: [ConflictProducerService, RabbitMQModule],
})
export class MessagingModule {}
