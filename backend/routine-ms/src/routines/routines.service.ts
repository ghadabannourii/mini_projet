import {
  Injectable,
  NotFoundException,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Routine, RoutineDocument } from './schemas/routine.schema';
import { GenerateRoutineDto } from './dto/generate-routine.dto';
import { UpdateStepsDto } from './dto/update-steps.dto';
import { RecommendationService } from '../ai-engine/recommendation.service';
import { ConflictDetectorService } from '../ai-engine/conflict-detector.service';
import { ConflictProducerService } from '../messaging/conflict-producer.service';

/**
 * Service métier principal pour la gestion des routines de soin.
 *
 * Responsabilités :
 *   - CRUD complet sur les documents Routine (MongoDB)
 *   - Orchestration du moteur IA : génération + détection de conflits
 *   - Publication RabbitMQ si conflit HIGH détecté
 */
@Injectable()
export class RoutinesService {
  private readonly logger = new Logger(RoutinesService.name);

  constructor(
    @InjectModel(Routine.name)
    private readonly routineModel: Model<RoutineDocument>,

    private readonly recommendationService: RecommendationService,
    private readonly conflictDetectorService: ConflictDetectorService,

    // forwardRef nécessaire car MessagingModule et RoutinesModule se référencent mutuellement
    @Inject(forwardRef(() => ConflictProducerService))
    private readonly conflictProducerService: ConflictProducerService,
  ) {}

  // ══════════════════════════════════════════════════════════════
  // GÉNÉRATION DE ROUTINE (logique cœur)
  // ══════════════════════════════════════════════════════════════

  /**
   * Génère (ou régénère) une routine complète pour un utilisateur.
   *
   * Workflow :
   *   1. Appel au moteur IA → étapes AM + PM
   *   2. Détection des conflits d'ingrédients
   *   3. Upsert MongoDB (crée ou remplace la routine existante)
   *   4. Si conflit HIGH → publication dans conflit_detecte_queue
   *
   * @param dto  Payload contenant userId, skinType, skinScore, realAge, skinAge
   * @returns    La routine complète persistée
   */
  async generateRoutine(dto: GenerateRoutineDto): Promise<RoutineDocument> {
    this.logger.log(
      `Génération de routine pour userId=${dto.userId}, skinType=${dto.skinType}, skinScore=${dto.skinScore}`,
    );

    // ─── 1. Génération des étapes via le moteur IA ───────────────
    const amSteps = this.recommendationService.generateAmSteps(
      dto.skinType,
      dto.skinScore,
    );
    const pmSteps = this.recommendationService.generatePmSteps(
      dto.skinType,
      dto.skinScore,
    );

    // ─── 2. Détection des conflits ───────────────────────────────
    const conflicts = this.conflictDetectorService.detectConflicts(
      amSteps,
      pmSteps,
    );

    if (conflicts.length > 0) {
      this.logger.warn(
        `${conflicts.length} conflit(s) détecté(s) pour userId=${dto.userId}`,
      );
    }

    // ─── 3. Upsert MongoDB ───────────────────────────────────────
    // findOneAndUpdate avec upsert=true : crée si inexistant, remplace sinon
    const routine = await this.routineModel.findOneAndUpdate(
      { userId: dto.userId },
      {
        userId: dto.userId,
        skinType: dto.skinType,
        amSteps,
        pmSteps,
        conflicts,
        generatedAt: new Date(),
        lastUpdatedAt: new Date(),
      },
      { new: true, upsert: true, runValidators: true },
    );

    // ─── 4. Publication RabbitMQ si conflit HIGH ─────────────────
    if (this.conflictDetectorService.hasHighSeverityConflict(conflicts)) {
      this.logger.warn(
        `Conflit HIGH détecté — publication dans conflit_detecte_queue pour userId=${dto.userId}`,
      );
      await this.conflictProducerService.publishHighConflict(
        dto.userId,
        (routine._id as unknown as string).toString(),
        conflicts,
      );
    }

    return routine;
  }

  // ══════════════════════════════════════════════════════════════
  // LECTURE
  // ══════════════════════════════════════════════════════════════

  /**
   * Retourne toutes les routines (usage admin/démo).
   */
  async findAll(): Promise<RoutineDocument[]> {
    return this.routineModel.find().exec();
  }

  /**
   * Retourne une routine par son _id MongoDB.
   * @throws NotFoundException si l'_id n'existe pas
   */
  async findById(id: string): Promise<RoutineDocument> {
    const routine = await this.routineModel.findById(id).exec();
    if (!routine) {
      throw new NotFoundException(`Routine avec l'id '${id}' introuvable`);
    }
    return routine;
  }

  /**
   * Retourne la routine complète d'un utilisateur par son userId.
   * @throws NotFoundException si aucune routine n'existe pour cet utilisateur
   */
  async findByUserId(userId: number): Promise<RoutineDocument> {
    const routine = await this.routineModel.findOne({ userId }).exec();
    if (!routine) {
      throw new NotFoundException(
        `Aucune routine trouvée pour l'utilisateur ${userId}`,
      );
    }
    return routine;
  }

  /**
   * Retourne uniquement les conflits de la routine d'un utilisateur.
   * @throws NotFoundException si la routine n'existe pas
   */
  async findConflictsByUserId(userId: number) {
    const routine = await this.findByUserId(userId);
    return routine.conflicts;
  }

  // ══════════════════════════════════════════════════════════════
  // MISE À JOUR
  // ══════════════════════════════════════════════════════════════

  /**
   * Met à jour manuellement les étapes AM ou PM d'un utilisateur.
   * Après la mise à jour, les conflits sont recalculés et la publication
   * RabbitMQ est déclenchée si nécessaire.
   *
   * @param userId  ID de l'utilisateur
   * @param dto     Contient period ('AM'|'PM') et les nouvelles étapes
   */
  async updateSteps(
    userId: number,
    dto: UpdateStepsDto,
  ): Promise<RoutineDocument> {
    const routine = await this.findByUserId(userId);

    // Mise à jour du tableau correspondant à la période
    if (dto.period === 'AM') {
      routine.amSteps = dto.steps as any;
    } else {
      routine.pmSteps = dto.steps as any;
    }

    // Recalcul des conflits après modification
    routine.conflicts = this.conflictDetectorService.detectConflicts(
      routine.amSteps,
      routine.pmSteps,
    ) as any;

    routine.lastUpdatedAt = new Date();
    const saved = await routine.save();

    // Publication si nouveau conflit HIGH
    if (this.conflictDetectorService.hasHighSeverityConflict(routine.conflicts)) {
      await this.conflictProducerService.publishHighConflict(
        userId,
        (saved._id as unknown as string).toString(),
        routine.conflicts,
      );
    }

    return saved;
  }

  /**
   * Met à jour le skinType d'un utilisateur et réajuste l'écran solaire.
   * Appelé par le consumer profil_maj_queue (RabbitMQ).
   *
   * @param userId      ID de l'utilisateur
   * @param newSkinType Nouveau type Fitzpatrick
   */
  async updateSkinType(
    userId: number,
    newSkinType: string,
  ): Promise<RoutineDocument> {
    const routine = await this.findByUserId(userId);

    this.logger.log(
      `Mise à jour skinType userId=${userId} : ${routine.skinType} → ${newSkinType}`,
    );

    // Régénération des étapes AM (l'écran solaire dépend du skinType)
    // On conserve le skinScore précédent — on le recalcule à partir des étapes existantes
    // Convention : si Rétinol dans PM → skinScore < 50, sinon > 50
    const haRetinol = routine.pmSteps.some(
      (s) => s.activeIngredient === 'Retinol',
    );
    const inferredSkinScore = haRetinol ? 40 : 65;

    routine.skinType = newSkinType;
    routine.amSteps = this.recommendationService.generateAmSteps(
      newSkinType,
      inferredSkinScore,
    ) as any;

    // Recalcul des conflits
    routine.conflicts = this.conflictDetectorService.detectConflicts(
      routine.amSteps,
      routine.pmSteps,
    ) as any;

    routine.lastUpdatedAt = new Date();
    return routine.save();
  }

  // ══════════════════════════════════════════════════════════════
  // SUPPRESSION
  // ══════════════════════════════════════════════════════════════

  /**
   * Supprime la routine d'un utilisateur.
   * @throws NotFoundException si la routine n'existe pas
   */
  async deleteByUserId(userId: number): Promise<{ message: string }> {
    const result = await this.routineModel.deleteOne({ userId }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(
        `Aucune routine trouvée pour l'utilisateur ${userId}`,
      );
    }
    return { message: `Routine de l'utilisateur ${userId} supprimée` };
  }
}
