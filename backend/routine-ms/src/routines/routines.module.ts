import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RoutinesController } from './routines.controller';
import { RoutinesService } from './routines.service';
import { Routine, RoutineSchema } from './schemas/routine.schema';
import { AiEngineModule } from '../ai-engine/ai-engine.module';
import { MessagingModule } from '../messaging/messaging.module';

/**
 * Module de gestion des routines de soin.
 *
 * Dépendances :
 *   - MongooseModule    : enregistre le schéma Routine
 *   - AiEngineModule    : RecommendationService + ConflictDetectorService
 *   - MessagingModule   : ConflictProducerService (avec forwardRef pour éviter la dépendance circulaire)
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Routine.name, schema: RoutineSchema },
    ]),
    AiEngineModule,
    // forwardRef résout : RoutinesModule → MessagingModule → RoutinesModule
    forwardRef(() => MessagingModule),
  ],
  controllers: [RoutinesController],
  providers: [RoutinesService],
  exports: [RoutinesService],
})
export class RoutinesModule {}
