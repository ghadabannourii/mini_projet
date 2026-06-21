import { Injectable } from '@nestjs/common';
import { RoutineStep } from '../routines/schemas/routine.schema';

/**
 * Service de recommandation — Moteur IA à base de règles (système expert).
 *
 * Ce service génère les étapes AM et PM personnalisées en fonction :
 *   - du type Fitzpatrick (skinType : I à VI) → détermine le SPF recommandé
 *   - du score de peau (skinScore : 0-100) → détermine le traitement actif
 *
 * Aucun appel externe (LLM, API) n'est effectué — la logique est entièrement
 * déterministe et démontrable en direct.
 */
@Injectable()
export class RecommendationService {
  /**
   * Génère les étapes de la routine du MATIN (AM).
   *
   * Protocole AM :
   *   1. Nettoyant doux (toujours)
   *   2. Sérum Vitamine C (si skinScore < 70 — peau qui a besoin d'éclat)
   *   3. Hydratant (toujours)
   *   4. Écran solaire : SPF 50 pour types I-II (peaux claires sensibles)
   *                      SPF 30 large spectre pour types III-VI
   *
   * @param skinType  Type Fitzpatrick I–VI
   * @param skinScore Score de santé de la peau (0–100)
   * @returns         Tableau d'étapes AM ordonnées
   */
  generateAmSteps(skinType: string, skinScore: number): RoutineStep[] {
    const steps: RoutineStep[] = [];
    let order = 1;

    // ─── Étape 1 : Nettoyant doux (obligatoire) ─────────────────
    steps.push({
      order: order++,
      category: 'cleanser',
      productName: 'Nettoyant doux à la glycérine',
      activeIngredient: 'Glycerin',
      notes: 'Appliquer sur peau humide, rincer à l\'eau tiède',
    });

    // ─── Étape 2 : Sérum Vitamine C (conditionnel — skinScore < 70) ──
    // La Vitamine C est un antioxydant qui illumine et protège.
    // On la prescrit uniquement si la peau montre des signes de fatigue.
    if (skinScore < 70) {
      steps.push({
        order: order++,
        category: 'serum',
        productName: 'Sérum éclat à la Vitamine C 15%',
        activeIngredient: 'Vitamin C',
        notes: 'Appliquer sur peau propre et sèche, quelques gouttes suffisent',
      });
    }

    // ─── Étape 3 : Hydratant (obligatoire) ───────────────────────
    steps.push({
      order: order++,
      category: 'moisturizer',
      productName: 'Crème hydratante à l\'acide hyaluronique',
      activeIngredient: 'Hyaluronic Acid',
      notes: 'Appliquer en couche fine sur tout le visage',
    });

    // ─── Étape 4 : Écran solaire (obligatoire) ───────────────────
    // Types I-II : peaux très claires → risque élevé → SPF 50
    // Types III-VI : peaux plus foncées → SPF 30 large spectre suffisant
    const isLightSkin = ['I', 'II'].includes(skinType);

    if (isLightSkin) {
      steps.push({
        order: order++,
        category: 'sunscreen',
        productName: 'Écran solaire SPF 50 protection maximale',
        activeIngredient: 'SPF',
        notes: 'Appliquer généreusement 20 min avant l\'exposition, renouveler toutes les 2h',
      });
    } else {
      steps.push({
        order: order++,
        category: 'sunscreen',
        productName: 'Écran solaire SPF 30 large spectre',
        activeIngredient: 'SPF',
        notes: 'Indispensable même par temps nuageux, renouveler en cas d\'exposition prolongée',
      });
    }

    return steps;
  }

  /**
   * Génère les étapes de la routine du SOIR (PM).
   *
   * Protocole PM :
   *   1. Nettoyant (obligatoire — double nettoyage recommandé le soir)
   *   2. Traitement actif :
   *      - Rétinol si skinScore < 50 (peau très abîmée → traitement réparateur fort)
   *      - Niacinamide sinon (régulateur de sébum doux, anti-taches)
   *   3. Hydratant riche (obligatoire — réparation nocturne)
   *
   * @param skinType  Type Fitzpatrick I–VI
   * @param skinScore Score de santé de la peau (0–100)
   * @returns         Tableau d'étapes PM ordonnées
   */
  generatePmSteps(_skinType: string, skinScore: number): RoutineStep[] {
    const steps: RoutineStep[] = [];
    let order = 1;

    // ─── Étape 1 : Nettoyant (obligatoire) ───────────────────────
    steps.push({
      order: order++,
      category: 'cleanser',
      productName: 'Huile démaquillante douce',
      activeIngredient: 'Jojoba Oil',
      notes: 'Masser sur peau sèche pour dissoudre le maquillage et le SPF',
    });

    // ─── Étape 2 : Traitement actif (conditionnel) ───────────────
    // skinScore < 50 → peau abîmée → Rétinol (renouvellement cellulaire)
    // skinScore >= 50 → peau en bonne santé → Niacinamide (entretien)
    if (skinScore < 50) {
      steps.push({
        order: order++,
        category: 'treatment',
        productName: 'Sérum Rétinol 0.3% (débutant)',
        activeIngredient: 'Retinol',
        notes: 'Commencer 2 fois/semaine, augmenter progressivement. Éviter le contour des yeux.',
      });
    } else {
      steps.push({
        order: order++,
        category: 'serum',
        productName: 'Sérum Niacinamide 10% + Zinc 1%',
        activeIngredient: 'Niacinamide',
        notes: 'Appliquer sur tout le visage, idéal pour les pores dilatés et les taches',
      });
    }

    // ─── Étape 3 : Hydratant riche (obligatoire) ─────────────────
    steps.push({
      order: order++,
      category: 'moisturizer',
      productName: 'Crème de nuit réparatrice au rétinol encapsulé',
      activeIngredient: 'Hyaluronic Acid',
      notes: 'Appliquer en couche généreuse, laisser absorber toute la nuit',
    });

    return steps;
  }
}
