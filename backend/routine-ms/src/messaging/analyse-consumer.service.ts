import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { RoutinesService } from '../routines/routines.service';
import { GenerateRoutineDto } from '../routines/dto/generate-routine.dto';

/**
 * Consumer RabbitMQ — écoute la queue analyse_terminee_queue.
 *
 * Déclenché par profil-ms lorsqu'une analyse de peau est terminée.
 * Applique exactement la même logique que POST /routines/generate :
 *   1. Génération des étapes AM/PM via le moteur IA
 *   2. Détection des conflits
 *   3. Upsert en MongoDB
 *   4. Publication dans conflit_detecte_queue si conflit HIGH
 *
 * Payload reçu (contrat figé) :
 *   { userId: number, skinScore: number, skinType: string, realAge: number, skinAge: number }
 */
@Injectable()
export class AnalyseConsumerService {
  private readonly logger = new Logger(AnalyseConsumerService.name);

  constructor(
    // forwardRef car MessagingModule et RoutinesModule se référencent mutuellement
    @Inject(forwardRef(() => RoutinesService))
    private readonly routinesService: RoutinesService,
  ) {}

  /**
   * Handler de la queue analyse_terminee_queue.
   * Le décorateur @RabbitSubscribe gère automatiquement l'ACK/NACK.
   */
  @RabbitSubscribe({
    exchange: 'skinbeauty.exchange',
    routingKey: 'analyse_terminee_queue',
    queue: 'analyse_terminee_queue',
    queueOptions: {
      durable: true, // la queue survit aux redémarrages de RabbitMQ
    },
  })
  async handleAnalyseTerminee(payload: {
    userId: number;
    skinScore: number;
    skinType: string;
    realAge: number;
    skinAge: number;
  }): Promise<void> {
    this.logger.log(
      `📥 Message reçu depuis analyse_terminee_queue — userId=${payload.userId}`,
    );

    try {
      // Réutilisation directe de la logique de génération
      const dto: GenerateRoutineDto = {
        userId: payload.userId,
        skinType: payload.skinType,
        skinScore: payload.skinScore,
        realAge: payload.realAge,
        skinAge: payload.skinAge,
      };

      const routine = await this.routinesService.generateRoutine(dto);

      this.logger.log(
        `✅ Routine générée automatiquement pour userId=${payload.userId} — ` +
          `${routine.amSteps.length} étapes AM, ${routine.pmSteps.length} étapes PM`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Erreur lors du traitement de analyse_terminee_queue pour userId=${payload.userId} : ` +
          (error as Error).message,
      );
      // On ne relance pas l'erreur pour éviter la boucle de retry infinie
    }
  }
}
