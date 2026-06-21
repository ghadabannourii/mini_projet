import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { RoutinesService } from '../routines/routines.service';

/**
 * Consumer RabbitMQ — écoute la queue profil_maj_queue.
 *
 * Déclenché par profil-ms lorsque le type de peau d'un utilisateur
 * est mis à jour (ex : après une nouvelle analyse ou correction manuelle).
 *
 * Action : met à jour skinType dans la routine existante,
 *          réajuste l'écran solaire (SPF50 vs SPF30) selon le nouveau type,
 *          recalcule les conflits, et sauvegarde en MongoDB.
 *
 * Payload reçu (contrat figé) :
 *   { userId: number, newSkinType: string }
 */
@Injectable()
export class ProfilConsumerService {
  private readonly logger = new Logger(ProfilConsumerService.name);

  constructor(
    // forwardRef car MessagingModule et RoutinesModule se référencent mutuellement
    @Inject(forwardRef(() => RoutinesService))
    private readonly routinesService: RoutinesService,
  ) {}

  /**
   * Handler de la queue profil_maj_queue.
   */
  @RabbitSubscribe({
    exchange: 'skinbeauty.exchange',
    routingKey: 'profil_maj_queue',
    queue: 'profil_maj_queue',
    queueOptions: {
      durable: true,
    },
  })
  async handleProfilMaj(payload: {
    userId: number;
    newSkinType: string;
  }): Promise<void> {
    this.logger.log(
      `📥 Message reçu depuis profil_maj_queue — userId=${payload.userId}, newSkinType=${payload.newSkinType}`,
    );

    try {
      const routine = await this.routinesService.updateSkinType(
        payload.userId,
        payload.newSkinType,
      );

      this.logger.log(
        `✅ skinType mis à jour pour userId=${payload.userId} → ${routine.skinType}`,
      );
    } catch (error) {
      // Si la routine n'existe pas encore, on logue sans planter
      this.logger.error(
        `❌ Erreur lors du traitement de profil_maj_queue pour userId=${payload.userId} : ` +
          (error as Error).message,
      );
    }
  }
}
