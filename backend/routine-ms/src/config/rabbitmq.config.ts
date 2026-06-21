import { RabbitMQConfig } from '@golevelup/nestjs-rabbitmq';

/**
 * Configuration de la connexion RabbitMQ pour @golevelup/nestjs-rabbitmq.
 *
 * Noms des queues (figés — utilisés aussi par profil-ms) :
 *   - analyse_terminee_queue  : consumer (routine-ms écoute les analyses finalisées)
 *   - profil_maj_queue        : consumer (routine-ms écoute les mises à jour de profil)
 *   - conflit_detecte_queue   : producer (routine-ms publie les conflits détectés)
 */
export const getRabbitMQConfig = (): RabbitMQConfig => ({
  exchanges: [
    {
      name: 'skinbeauty.exchange',
      type: 'direct',
    },
  ],
  uri: process.env.RABBITMQ_URI ?? 'amqp://guest:guest@localhost:5672',
  connectionInitOptions: {
    // Ne pas bloquer le démarrage si RabbitMQ est indisponible
    wait: false,
    timeout: 5000,
  },
  // Reconnexion automatique en cas de coupure
  connectionManagerOptions: {
    reconnectTimeInSeconds: 5,
  },
});
