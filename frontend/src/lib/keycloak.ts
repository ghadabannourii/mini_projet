/**
 * Intégration Keycloak — SkinBeauty Frontend
 *
 * Gère l'authentification via Keycloak (OIDC/OAuth2).
 * Les tokens JWT sont stockés en mémoire (pas localStorage pour la sécurité).
 *
 * Realm       : SkinBeautyRealm
 * Client      : skinbeauty-frontend (public, PKCE)
 * Keycloak URL: http://localhost:8099
 *
 * Rôles utilisés côté Gateway :
 *   - realm role "user"  → ROLE_USER  (lecture)
 *   - realm role "admin" → ROLE_ADMIN (écriture)
 */

const KEYCLOAK_URL = import.meta.env.VITE_KEYCLOAK_URL ?? "http://localhost:8099";
const REALM = import.meta.env.VITE_KEYCLOAK_REALM ?? "SkinBeautyRealm";
const CLIENT_ID = import.meta.env.VITE_KEYCLOAK_CLIENT_ID ?? "skinbeauty-frontend";

// ─── Token store en mémoire (plus sûr que localStorage) ──────────────────────

let _accessToken: string | null = null;
let _refreshToken: string | null = null;
let _tokenExpiry: number = 0;

export interface KeycloakTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export interface KeycloakUserInfo {
  sub: string;
  preferred_username: string;
  email: string;
  name: string;
  realm_access: { roles: string[] };
}

// ─── API Keycloak ─────────────────────────────────────────────────────────────

const TOKEN_URL = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`;
const USERINFO_URL = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/userinfo`;
const LOGOUT_URL = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/logout`;

/**
 * Connexion avec username + password (Resource Owner Password Credentials).
 * Utilisé pour la démonstration en développement.
 * En production, utiliser le flow Authorization Code + PKCE.
 */
export async function login(username: string, password: string): Promise<KeycloakTokens> {
  const params = new URLSearchParams({
    grant_type: "password",
    client_id: CLIENT_ID,
    username,
    password,
    scope: "openid profile email",
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error_description ?? "Identifiants incorrects");
  }

  const tokens: KeycloakTokens = await res.json();
  _accessToken = tokens.access_token;
  _refreshToken = tokens.refresh_token;
  _tokenExpiry = Date.now() + tokens.expires_in * 1000 - 10000; // -10s marge

  return tokens;
}

/**
 * Rafraîchissement automatique du token avant expiration.
 */
export async function refreshToken(): Promise<void> {
  if (!_refreshToken) return;

  const params = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: CLIENT_ID,
    refresh_token: _refreshToken,
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (res.ok) {
    const tokens: KeycloakTokens = await res.json();
    _accessToken = tokens.access_token;
    _refreshToken = tokens.refresh_token;
    _tokenExpiry = Date.now() + tokens.expires_in * 1000 - 10000;
  } else {
    // Token expiré — forcer reconnexion
    logout();
  }
}

/** Déconnexion — révocation du refresh token et nettoyage. */
export async function logout(): Promise<void> {
  if (_refreshToken) {
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      refresh_token: _refreshToken,
    });
    await fetch(LOGOUT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    }).catch(() => {});
  }
  _accessToken = null;
  _refreshToken = null;
  _tokenExpiry = 0;
}

/**
 * Retourne le token d'accès courant, en le rafraîchissant si nécessaire.
 * À injecter dans les headers Authorization: Bearer <token>
 */
export async function getAccessToken(): Promise<string | null> {
  if (!_accessToken) return null;

  // Si le token expire dans moins de 10s, on le rafraîchit
  if (Date.now() > _tokenExpiry) {
    await refreshToken();
  }

  return _accessToken;
}

/** Retourne les informations de l'utilisateur connecté depuis Keycloak. */
export async function getUserInfo(): Promise<KeycloakUserInfo | null> {
  const token = await getAccessToken();
  if (!token) return null;

  const res = await fetch(USERINFO_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return null;
  return res.json();
}

/** Vérifie si l'utilisateur est actuellement connecté. */
export function isAuthenticated(): boolean {
  return !!_accessToken && Date.now() < _tokenExpiry + 10000;
}

/** Décode le payload JWT (sans vérification de signature — côté client). */
export function decodeJwtPayload(token: string): Record<string, unknown> {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return {};
  }
}

/** Retourne les rôles realm de l'utilisateur connecté. */
export function getUserRoles(): string[] {
  if (!_accessToken) return [];
  const payload = decodeJwtPayload(_accessToken);
  const realmAccess = payload.realm_access as { roles?: string[] } | undefined;
  return realmAccess?.roles ?? [];
}

/** Vérifie si l'utilisateur a un rôle donné. */
export function hasRole(role: string): boolean {
  return getUserRoles().includes(role);
}
