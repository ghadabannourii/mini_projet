/**
 * Couche API — communication avec les microservices SkinBeauty.
 *
 * En développement : appels directs vers les services (sans Gateway).
 * En production (via Gateway port 9999) : JWT Keycloak injecté automatiquement.
 *
 * Le token JWT est récupéré depuis keycloak.ts et injecté dans
 * chaque requête via le header Authorization: Bearer <token>.
 */

import { getAccessToken } from "./keycloak";

// URL de base selon l'environnement
const PROFIL_BASE = import.meta.env.VITE_PROFIL_API_URL ?? "http://localhost:8081";
const ROUTINE_BASE = import.meta.env.VITE_ROUTINE_API_URL ?? "http://localhost:3001";

// ─── Types miroir des entités backend ────────────────────────────────────────

export interface Utilisateur {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  typePeau: string;
}

export interface AnalyseCutanee {
  id: number;
  utilisateur: { id: number };
  score: number;
  ageReel: number;
  agePeau: number;
  dateAnalyse: string;
}

export interface AlerteConflit {
  id: number;
  utilisateurId: number;
  routineId: string;
  severite: string;
  detailsConflits: string[];
  dateAlerte: string;
}

export interface RoutineStep {
  order: number;
  category: string;
  productName: string;
  activeIngredient: string;
  notes: string;
}

export interface Conflict {
  ingredientA: string;
  ingredientB: string;
  severity: string;
  recommendation: string;
}

export interface Routine {
  id?: string;
  _id?: string;
  userId: number;
  skinType: string;
  amSteps: RoutineStep[];
  pmSteps: RoutineStep[];
  conflicts: Conflict[];
  generatedAt?: string;
  lastUpdatedAt?: string;
}

// ─── Helper fetch avec gestion d'erreur + injection JWT ──────────────────────

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  // Récupération du token Keycloak (null si non connecté ou en mode dev)
  const token = await getAccessToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  };

  // Injection automatique du JWT si disponible
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`${res.status}: ${text}`);
  }
  return res.json();
}

// ═══════════════════════════════════════════════════════════════════════════════
// UTILISATEURS (profil-ms)
// ═══════════════════════════════════════════════════════════════════════════════

export const utilisateurApi = {
  /** Liste tous les utilisateurs */
  getAll: () => apiFetch<Utilisateur[]>(`${PROFIL_BASE}/utilisateurs`),

  /** Un utilisateur par id */
  getById: (id: number) => apiFetch<Utilisateur>(`${PROFIL_BASE}/utilisateurs/${id}`),

  /** Créer un utilisateur */
  create: (u: Omit<Utilisateur, "id">) =>
    apiFetch<Utilisateur>(`${PROFIL_BASE}/utilisateurs`, {
      method: "POST",
      body: JSON.stringify(u),
    }),

  /** Modifier un utilisateur */
  update: (id: number, u: Partial<Utilisateur>) =>
    apiFetch<Utilisateur>(`${PROFIL_BASE}/utilisateurs/${id}`, {
      method: "PUT",
      body: JSON.stringify(u),
    }),

  /** Supprimer un utilisateur */
  delete: (id: number) =>
    fetch(`${PROFIL_BASE}/utilisateurs/${id}`, { method: "DELETE" }),

  /** Mettre à jour le type de peau + publish sur profil_maj_queue */
  updateTypePeau: (id: number, typePeau: string) =>
    apiFetch<Utilisateur>(`${PROFIL_BASE}/utilisateurs/${id}/type-peau`, {
      method: "PUT",
      body: JSON.stringify({ typePeau }),
    }),

  /** Récupère la routine via Feign (appel synchrone profil-ms → routine-ms) */
  getRoutine: (id: number) =>
    apiFetch<Routine>(`${PROFIL_BASE}/utilisateurs/${id}/routine`),

  /** Récupère les conflits via Feign */
  getConflits: (id: number) =>
    apiFetch<Conflict[]>(`${PROFIL_BASE}/utilisateurs/${id}/conflits`),

  /** Régénère la routine via Feign */
  regenererRoutine: (id: number) =>
    apiFetch<Routine>(`${PROFIL_BASE}/utilisateurs/${id}/routine/regenerer`, {
      method: "POST",
    }),
};

// ═══════════════════════════════════════════════════════════════════════════════
// ANALYSES (profil-ms)
// ═══════════════════════════════════════════════════════════════════════════════

export const analyseApi = {
  getAll: () => apiFetch<AnalyseCutanee[]>(`${PROFIL_BASE}/analyses`),

  getById: (id: number) => apiFetch<AnalyseCutanee>(`${PROFIL_BASE}/analyses/${id}`),

  getByUtilisateur: (userId: number) =>
    apiFetch<AnalyseCutanee[]>(`${PROFIL_BASE}/analyses/utilisateur/${userId}`),

  /** Créer une analyse + publish sur analyse_terminee_queue */
  create: (analyse: { utilisateur: { id: number }; score: number; ageReel: number; agePeau: number; dateAnalyse: string }) =>
    apiFetch<AnalyseCutanee>(`${PROFIL_BASE}/analyses`, {
      method: "POST",
      body: JSON.stringify(analyse),
    }),
};

// ═══════════════════════════════════════════════════════════════════════════════
// ALERTES (profil-ms)
// ═══════════════════════════════════════════════════════════════════════════════

export const alerteApi = {
  getAll: () => apiFetch<AlerteConflit[]>(`${PROFIL_BASE}/alertes`),

  getByUtilisateur: (userId: number) =>
    apiFetch<AlerteConflit[]>(`${PROFIL_BASE}/alertes/utilisateur/${userId}`),
};

// ═══════════════════════════════════════════════════════════════════════════════
// ROUTINES (routine-ms direct)
// ═══════════════════════════════════════════════════════════════════════════════

export const routineApi = {
  getAll: () => apiFetch<Routine[]>(`${ROUTINE_BASE}/routines`),

  getById: (id: string) => apiFetch<Routine>(`${ROUTINE_BASE}/routines/${id}`),

  getByUserId: (userId: number) =>
    apiFetch<Routine>(`${ROUTINE_BASE}/routines/user/${userId}`),

  getConflicts: (userId: number) =>
    apiFetch<Conflict[]>(`${ROUTINE_BASE}/routines/user/${userId}/conflicts`),

  generate: (payload: {
    userId: number;
    skinType: string;
    skinScore: number;
    realAge: number;
    skinAge: number;
  }) =>
    apiFetch<Routine>(`${ROUTINE_BASE}/routines/generate`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  delete: (userId: number) =>
    apiFetch<{ message: string }>(`${ROUTINE_BASE}/routines/user/${userId}`, {
      method: "DELETE",
    }),

  health: () => apiFetch<{ status: string; service: string }>(`${ROUTINE_BASE}/health`),
};

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIG-SERVER welcome
// ═══════════════════════════════════════════════════════════════════════════════

export const configApi = {
  getWelcome: () => fetch(`${PROFIL_BASE}/welcome`).then((r) => r.text()),
};
