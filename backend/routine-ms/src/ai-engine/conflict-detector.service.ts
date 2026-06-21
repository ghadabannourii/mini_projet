import { Injectable } from '@nestjs/common';
import { RoutineStep, IngredientConflict } from '../routines/schemas/routine.schema';
import { INGREDIENT_RULES } from './knowledge-base/ingredient-rules';

/**
 * Service de détection de conflits d'ingrédients.
 *
 * Algorithme :
 *   1. Extraire tous les activeIngredient des étapes AM + PM
 *   2. Générer toutes les paires possibles (combinaisons sans répétition)
 *   3. Pour chaque paire, vérifier si une règle existe dans INGREDIENT_RULES
 *      (la comparaison est bidirectionnelle : A+B = B+A)
 *   4. Retourner la liste des conflits trouvés
 *
 * Ce service ne lève pas d'exception — il retourne simplement un tableau
 * vide si aucun conflit n'est détecté.
 */
@Injectable()
export class ConflictDetectorService {
  /**
   * Détecte les conflits dans une routine complète (AM + PM).
   *
   * @param amSteps  Étapes de la routine du matin
   * @param pmSteps  Étapes de la routine du soir
   * @returns        Tableau des conflits détectés (peut être vide)
   */
  detectConflicts(
    amSteps: RoutineStep[],
    pmSteps: RoutineStep[],
  ): IngredientConflict[] {
    // ─── 1. Récupérer tous les ingrédients actifs ────────────────
    const allIngredients: string[] = [
      ...amSteps.map((step) => step.activeIngredient),
      ...pmSteps.map((step) => step.activeIngredient),
    ].filter(Boolean); // supprimer les valeurs vides

    const conflicts: IngredientConflict[] = [];

    // ─── 2. Générer toutes les paires (i, j) sans doublons ───────
    // On itère i de 0 à n-1 et j de i+1 à n pour éviter A+B et B+A
    for (let i = 0; i < allIngredients.length; i++) {
      for (let j = i + 1; j < allIngredients.length; j++) {
        const ingA = allIngredients[i];
        const ingB = allIngredients[j];

        // ─── 3. Chercher une règle correspondante ─────────────────
        // La règle peut être définie dans les deux sens (A-B ou B-A)
        const rule = INGREDIENT_RULES.find(
          (r) =>
            (r.ingredientA === ingA && r.ingredientB === ingB) ||
            (r.ingredientA === ingB && r.ingredientB === ingA),
        );

        if (rule) {
          // Conflit trouvé — on l'ajoute au résultat
          conflicts.push({
            ingredientA: rule.ingredientA,
            ingredientB: rule.ingredientB,
            severity: rule.severity,
            recommendation: rule.recommendation,
          });
        }
      }
    }

    return conflicts;
  }

  /**
   * Indique si une liste de conflits contient au moins un conflit de sévérité HIGH.
   * Utilisé pour décider si on doit publier dans conflit_detecte_queue.
   *
   * @param conflicts  Liste de conflits à analyser
   * @returns          true si au moins un conflit HIGH est présent
   */
  hasHighSeverityConflict(conflicts: IngredientConflict[]): boolean {
    return conflicts.some((c) => c.severity === 'high');
  }
}
