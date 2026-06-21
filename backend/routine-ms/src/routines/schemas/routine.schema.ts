import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

// ─── Types utilitaires ───────────────────────────────────────────

/** Type Mongoose pour la résolution de documents */
export type RoutineDocument = HydratedDocument<Routine>;

// ─── Schémas imbriqués ───────────────────────────────────────────

/**
 * Une étape individuelle de la routine (AM ou PM).
 * Ex : Nettoyant, Sérum Vitamine C, Écran solaire SPF50...
 */
@Schema({ _id: false }) // pas d'_id auto pour les sous-documents
export class RoutineStep {
  /** Ordre d'application (1 = premier à appliquer) */
  @Prop({ required: true })
  order: number;

  /** Catégorie du produit */
  @Prop({
    required: true,
    enum: ['cleanser', 'serum', 'moisturizer', 'sunscreen', 'treatment', 'toner'],
  })
  category: string;

  /** Nom commercial ou générique du produit */
  @Prop({ required: true })
  productName: string;

  /**
   * Ingrédient actif principal — utilisé par le détecteur de conflits.
   * Ex: 'Vitamin C', 'Retinol', 'Niacinamide', 'AHA/BHA', 'SPF'
   */
  @Prop({ required: true })
  activeIngredient: string;

  /** Notes d'application ou conseils spécifiques */
  @Prop({ default: '' })
  notes: string;
}

export const RoutineStepSchema = SchemaFactory.createForClass(RoutineStep);

/**
 * Un conflit d'ingrédients détecté dans la routine.
 * Ex : Rétinol + AHA/BHA → sévérité HIGH
 */
@Schema({ _id: false })
export class IngredientConflict {
  @Prop({ required: true })
  ingredientA: string;

  @Prop({ required: true })
  ingredientB: string;

  /** Niveau de dangerosité de la combinaison */
  @Prop({ required: true, enum: ['low', 'medium', 'high'] })
  severity: string;

  /** Conseil pratique pour l'utilisateur */
  @Prop({ required: true })
  recommendation: string;
}

export const IngredientConflictSchema =
  SchemaFactory.createForClass(IngredientConflict);

// ─── Schéma principal ────────────────────────────────────────────

/**
 * Document principal représentant la routine de soin d'un utilisateur.
 * Une routine est unique par userId (index unique sur ce champ).
 */
@Schema({ timestamps: false }) // on gère manuellement generatedAt / lastUpdatedAt
export class Routine {
  /** ID de l'utilisateur côté profil-ms (clé étrangère logique) */
  @Prop({ required: true, unique: true, index: true })
  userId: number;

  /** Type Fitzpatrick de la peau (I à VI) */
  @Prop({ required: true, enum: ['I', 'II', 'III', 'IV', 'V', 'VI'] })
  skinType: string;

  /** Étapes de la routine du matin */
  @Prop({ type: [RoutineStepSchema], default: [] })
  amSteps: RoutineStep[];

  /** Étapes de la routine du soir */
  @Prop({ type: [RoutineStepSchema], default: [] })
  pmSteps: RoutineStep[];

  /** Conflits d'ingrédients détectés sur l'ensemble de la routine */
  @Prop({ type: [IngredientConflictSchema], default: [] })
  conflicts: IngredientConflict[];

  /** Date de génération initiale de la routine */
  @Prop({ default: () => new Date() })
  generatedAt: Date;

  /** Date de dernière mise à jour */
  @Prop({ default: () => new Date() })
  lastUpdatedAt: Date;
}

export const RoutineSchema = SchemaFactory.createForClass(Routine);
