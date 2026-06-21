import { Module } from '@nestjs/common';
import { RecommendationService } from './recommendation.service';
import { ConflictDetectorService } from './conflict-detector.service';

/**
 * Module du moteur IA (système expert à base de règles).
 *
 * Expose deux services :
 *   - RecommendationService  : génère les étapes AM/PM personnalisées
 *   - ConflictDetectorService : détecte les conflits d'ingrédients
 *
 * Ces services sont exportés pour être injectés dans RoutinesModule
 * et MessagingModule.
 */
@Module({
  providers: [RecommendationService, ConflictDetectorService],
  exports: [RecommendationService, ConflictDetectorService],
})
export class AiEngineModule {}
