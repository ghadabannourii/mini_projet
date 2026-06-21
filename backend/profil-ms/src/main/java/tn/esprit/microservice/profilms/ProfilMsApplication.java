package tn.esprit.microservice.profilms;

import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.Bean;
import tn.esprit.microservice.profilms.entity.AnalyseCutanee;
import tn.esprit.microservice.profilms.entity.Utilisateur;
import tn.esprit.microservice.profilms.repository.AnalyseCutaneeRepository;
import tn.esprit.microservice.profilms.repository.UtilisateurRepository;

import java.time.LocalDate;

/**
 * Classe principale de profil-ms.
 * Active Feign (appels synchrones vers ROUTINE-MS) et la découverte Eureka.
 * Un ApplicationRunner insère des données de test au premier démarrage.
 */
@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
public class ProfilMsApplication {

    public static void main(String[] args) {
        SpringApplication.run(ProfilMsApplication.class, args);
    }

    /**
     * Initialise des données de test si la base est vide.
     * Insère 4 utilisateurs avec des types Fitzpatrick variés,
     * chacun avec une analyse cutanée initiale.
     * Cela permet de tester les appels Feign et les messages RabbitMQ
     * dès le premier lancement, sans saisie manuelle.
     */
    @Bean
    ApplicationRunner initData(UtilisateurRepository utilisateurRepo,
                               AnalyseCutaneeRepository analyseRepo) {
        return args -> {
            // Ne pas insérer si des données existent déjà (idempotent)
            if (utilisateurRepo.count() > 0) return;

            // ─── Utilisateur 1 : type I (peau très claire) ───────────
            Utilisateur u1 = utilisateurRepo.save(
                new Utilisateur(null, "Dupont", "Alice", "alice@deepskyn.tn", "I")
            );
            analyseRepo.save(
                new AnalyseCutanee(null, u1, 45, 28, 34, LocalDate.now())
            );

            // ─── Utilisateur 2 : type III (peau méditerranéenne) ─────
            Utilisateur u2 = utilisateurRepo.save(
                new Utilisateur(null, "Ben Ali", "Youssef", "youssef@deepskyn.tn", "III")
            );
            analyseRepo.save(
                new AnalyseCutanee(null, u2, 72, 35, 30, LocalDate.now())
            );

            // ─── Utilisateur 3 : type V (peau mate à foncée) ─────────
            Utilisateur u3 = utilisateurRepo.save(
                new Utilisateur(null, "Traoré", "Aminata", "aminata@deepskyn.tn", "V")
            );
            analyseRepo.save(
                new AnalyseCutanee(null, u3, 88, 22, 20, LocalDate.now())
            );

            // ─── Utilisateur 4 : type II (peau claire) ───────────────
            Utilisateur u4 = utilisateurRepo.save(
                new Utilisateur(null, "Martin", "Lucas", "lucas@deepskyn.tn", "II")
            );
            analyseRepo.save(
                new AnalyseCutanee(null, u4, 38, 42, 50, LocalDate.now())
            );

            System.out.println("✅ Données de test insérées : 4 utilisateurs + 4 analyses");
        };
    }
}
