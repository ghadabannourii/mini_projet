package tn.esprit.microservice.gateway;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtGrantedAuthoritiesConverterAdapter;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtAuthenticationConverter;
import org.springframework.security.web.server.SecurityWebFilterChain;

/**
 * Configuration de sécurité de la Gateway DeepSkyn.
 *
 * ── Sécurité Keycloak avec gestion des rôles ──────────────────────────────
 *
 * Le JWT émis par Keycloak contient les rôles dans :
 *   "realm_access": { "roles": ["user", "admin"] }
 *
 * KeycloakRoleConverter extrait ces rôles et les transforme en authorities :
 *   "user"  → ROLE_user  → hasRole("user")  ou hasAnyRole("USER", "ADMIN")
 *   "admin" → ROLE_admin → hasRole("admin")
 *
 * ── Politique d'accès ─────────────────────────────────────────────────────
 *   - /actuator/**, /eureka/** → public (monitoring interne)
 *   - GET sur les ressources   → ROLE_user ou ROLE_admin
 *   - POST/PUT/DELETE          → ROLE_admin uniquement
 *   - Tout le reste            → authentifié (token JWT valide)
 */
@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    /**
     * Converter JWT → AuthenticationToken avec extraction des rôles Keycloak.
     * Utilise KeycloakRoleConverter pour lire realm_access.roles.
     */
    @Bean
    public ReactiveJwtAuthenticationConverter jwtAuthenticationConverter() {
        ReactiveJwtAuthenticationConverter converter = new ReactiveJwtAuthenticationConverter();
        // Injection du converter de rôles Keycloak personnalisé
        converter.setJwtGrantedAuthoritiesConverter(
            new ReactiveJwtGrantedAuthoritiesConverterAdapter(new KeycloakRoleConverter())
        );
        return converter;
    }

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        http
            // Désactiver CSRF — API REST stateless, JWT suffit
            .csrf(ServerHttpSecurity.CsrfSpec::disable)

            // ── Règles d'autorisation ─────────────────────────────────────
            .authorizeExchange(exchanges -> exchanges

                // Endpoints publics : monitoring + découverte de services
                .pathMatchers("/actuator/**", "/eureka/**").permitAll()

                // Documentation Swagger : publique pour la démo
                .pathMatchers("/api-docs/**", "/swagger-ui/**", "/v3/api-docs/**").permitAll()

                // ── Lecture : rôle user ou admin ──────────────────────────
                // Tous les utilisateurs authentifiés peuvent consulter
                .pathMatchers(HttpMethod.GET, "/utilisateurs/**").hasAnyRole("user", "admin")
                .pathMatchers(HttpMethod.GET, "/analyses/**").hasAnyRole("user", "admin")
                .pathMatchers(HttpMethod.GET, "/alertes/**").hasAnyRole("user", "admin")
                .pathMatchers(HttpMethod.GET, "/routines/**").hasAnyRole("user", "admin")
                .pathMatchers(HttpMethod.GET, "/welcome").hasAnyRole("user", "admin")
                .pathMatchers(HttpMethod.GET, "/health").hasAnyRole("user", "admin")

                // ── Écriture : rôle admin requis ───────────────────────────
                // Seuls les admins peuvent créer/modifier/supprimer
                .pathMatchers(HttpMethod.POST, "/utilisateurs/**").hasRole("admin")
                .pathMatchers(HttpMethod.PUT, "/utilisateurs/**").hasRole("admin")
                .pathMatchers(HttpMethod.DELETE, "/utilisateurs/**").hasRole("admin")
                .pathMatchers(HttpMethod.POST, "/analyses/**").hasRole("admin")

                // Génération de routine : user peut déclencher sur lui-même
                .pathMatchers(HttpMethod.POST, "/routines/**").hasAnyRole("user", "admin")

                // Tout le reste : authentifié
                .anyExchange().authenticated()
            )

            // ── Resource Server JWT avec converter Keycloak ───────────────
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt
                    .jwtAuthenticationConverter(jwtAuthenticationConverter())
                )
            );

        return http.build();
    }
}
