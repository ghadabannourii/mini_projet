package tn.esprit.microservice.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * Point d'entrée de la Gateway — DeepSkyn.
 * Porte d'entrée unique vers PROFIL-MS et ROUTINE-MS.
 * Sécurisée via Keycloak (JWT OAuth2).
 * Port : 9999
 */
@SpringBootApplication
@EnableDiscoveryClient
public class GatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(GatewayApplication.class, args);
    }
}
