import { Injectable, Logger } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { IngredientConflict } from '../routines/schemas/routine.schema';

/**
 * Service producteur RabbitMQ — publie dans conflit_detecte_queue.
 *
 * Déclenché quand au moins un conflit de sévérité HIGH est détecté
 * lors d'une génération ou d'une mise à jour de routine.
 *
 * Payload publié (contrat figé) :
 *   { userId, routineId, conflicts, severity }
 *
 * profil-ms consomme cette queue pour notifier l'utilisateur
 * et stocker l'alerte côté MySQL.
 */
@Injectable()
export class ConflictProducerService {
  private readonly logger = new Logger(ConflictProducerService.name);

  constructor(private readonly amqpConnection: AmqpConnection) {}

  /**
   * Publie un message de conflit HIGH dans conflit_detecte_queue.
   *
   * @param userId     ID de l'utilisateur concerné
   * @param routineId  _id MongoDB de la routine
   * @param conflicts  Liste complète des conflits détectés
   */
  async publishHighConflict(
    userId: number,
    routineId: string,
    conflicts: IngredientConflict[],
  ): Promise<void> {
    // Sévérité globale = 'high' si au moins un conflit HIGH
    const globalSeverity = conflicts.some((c) => c.severity === 'high')
      ? 'high'
      : conflicts.some((c) => c.severity === 'medium')
        ? 'medium'
        : 'low';

    const payload = {
      userId,
      routineId,
      conflicts,
      severity: globalSeverity,
    };

    try {
      // Publication directe dans la queue (routing key = nom de la queue)
      await this.amqpConnection.publish(
        'skinbeauty.exchange',
        'conflit_detecte_queue',
        payload,
      );

      this.logger.log(
        `📤 Message publié dans conflit_detecte_queue — userId=${userId}, severity=${globalSeverity}`,
      );
    } catch (error) {
      // Ne pas bloquer le flux principal si RabbitMQ est indisponible
      this.logger.error(
        `Échec de la publication dans conflit_detecte_queue : ${(error as Error).message}`,
      );
    }
  }
}
