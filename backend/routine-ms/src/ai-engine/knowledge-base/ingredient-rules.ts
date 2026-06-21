/**
 * Base de connaissances — règles de conflits d'ingrédients cosmétiques.
 *
 * Chaque règle décrit une combinaison d'ingrédients à surveiller.
 * Cette base est utilisée par ConflictDetectorService pour analyser
 * les routines générées et alerter l'utilisateur.
 *
 * Niveaux de sévérité :
 *   - 'low'    : compatible mais à utiliser avec précaution
 *   - 'medium' : espacer l'application (matin/soir ou quelques heures)
 *   - 'high'   : ne jamais combiner — risque d'irritation ou d'inactivation
 */
export interface IngredientRule {
  ingredientA: string;
  ingredientB: string;
  severity: 'low' | 'medium' | 'high';
  recommendation: string;
}

/**
 * Règles figées du contrat d'API SkinBeauty.
 * Ne pas modifier les champs — profil-ms consomme ces données
 * telles quelles via la queue conflit_detecte_queue.
 */
export const INGREDIENT_RULES: IngredientRule[] = [
  {
    ingredientA: 'Retinol',
    ingredientB: 'Vitamin C',
    severity: 'medium',
    recommendation: 'Utiliser à des moments différents (matin/soir)',
  },
  {
    ingredientA: 'Retinol',
    ingredientB: 'AHA/BHA',
    severity: 'high',
    recommendation: 'Alterner les soirs pour éviter l\'irritation',
  },
  {
    ingredientA: 'Retinol',
    ingredientB: 'Benzoyl Peroxide',
    severity: 'high',
    recommendation: 'Ne jamais combiner, le benzoyle désactive le rétinol',
  },
  {
    ingredientA: 'Vitamin C',
    ingredientB: 'AHA/BHA',
    severity: 'medium',
    recommendation: 'Espacer l\'application de quelques heures',
  },
  {
    ingredientA: 'Niacinamide',
    ingredientB: 'Vitamin C',
    severity: 'low',
    recommendation: 'Généralement compatible, à dose modérée',
  },
  // ─── Règles supplémentaires (robustesse du système) ──────────
  {
    ingredientA: 'Retinol',
    ingredientB: 'Hyaluronic Acid',
    severity: 'low',
    recommendation: 'Appliquer l\'acide hyaluronique après le rétinol pour réduire l\'irritation',
  },
  {
    ingredientA: 'AHA/BHA',
    ingredientB: 'Benzoyl Peroxide',
    severity: 'medium',
    recommendation: 'Peut provoquer une irritation excessive — utiliser en alternance',
  },
  {
    ingredientA: 'SPF',
    ingredientB: 'AHA/BHA',
    severity: 'low',
    recommendation: 'Appliquer le SPF après les acides, ne pas mélanger directement',
  },
];
