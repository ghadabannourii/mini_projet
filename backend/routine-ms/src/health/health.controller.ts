import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

/**
 * Contrôleur de santé du service.
 *
 * Expose GET /health — appelé par :
 *   - Eureka pour les health checks d'instance
 *   - Docker HEALTHCHECK
 *   - profil-ms pour vérifier la disponibilité avant les appels Feign
 *
 * Retourne toujours { status: 'UP', service: 'routine-ms' }
 */
@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({
    summary: 'Vérification de santé du microservice',
    description:
      "Retourne le statut UP du service. Utilisé par Eureka et les load balancers.",
  })
  @ApiResponse({
    status: 200,
    description: 'Service opérationnel',
    schema: {
      example: { status: 'UP', service: 'routine-ms' },
    },
  })
  check(): { status: string; service: string } {
    return { status: 'UP', service: 'routine-ms' };
  }
}
