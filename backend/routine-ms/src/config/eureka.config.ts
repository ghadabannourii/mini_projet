import { Eureka } from 'eureka-js-client';

/**
 * Initialise et enregistre le microservice auprès du serveur Eureka.
 *
 * Convention Eureka : le nom d'application est en MAJUSCULES (ROUTINE-MS).
 * L'enregistrement est tenté au démarrage mais n'est PAS bloquant :
 * si Eureka est indisponible (ex : en dev local), le service continue.
 */
export function initEureka(): void {
  const eurekaHost = process.env.EUREKA_HOST ?? 'localhost';
  const eurekaPort = parseInt(process.env.EUREKA_PORT ?? '8761', 10);
  const servicePort = parseInt(process.env.PORT ?? '3001', 10);
  const serviceName = process.env.SERVICE_NAME ?? 'ROUTINE-MS';

  // Identifiant unique de l'instance (hostname + port)
  const instanceId = `${serviceName.toLowerCase()}:${servicePort}`;

  const client = new Eureka({
    instance: {
      app: serviceName,           // Nom enregistré dans Eureka (ROUTINE-MS)
      instanceId,
      hostName: 'localhost',
      ipAddr: '127.0.0.1',
      port: {
        $: servicePort,
        '@enabled': true,
      },
      vipAddress: serviceName.toLowerCase(),
      dataCenterInfo: {
        '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
        name: 'MyOwn',
      },
      statusPageUrl: `http://localhost:${servicePort}/api-docs`,
      healthCheckUrl: `http://localhost:${servicePort}/health`,
    },
    eureka: {
      host: eurekaHost,
      port: eurekaPort,
      servicePath: '/eureka/apps/',
      maxRetries: 3,
      requestRetryDelay: 2000,
    },
  });

  // Démarrage de l'enregistrement Eureka
  client.start((error: Error) => {
    if (error) {
      console.error(
        `❌ Échec de l'enregistrement Eureka (${eurekaHost}:${eurekaPort}) :`,
        error.message,
      );
    } else {
      console.log(
        `✅ Service ${serviceName} enregistré dans Eureka sur ${eurekaHost}:${eurekaPort}`,
      );
    }
  });
}
