package tn.esprit.microservice.profilms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

/**
 * Entité JPA — analyse cutanée d'un utilisateur.
 * Après save, un message est publié sur analyse_terminee_queue pour
 * déclencher la génération automatique de la routine dans routine-ms.
 */
@Entity @Table(name = "analyses_cutanees")
@Data @NoArgsConstructor @AllArgsConstructor
public class AnalyseCutanee {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private Utilisateur utilisateur;

    /** Score IA de santé de la peau (0 = très abîmée, 100 = parfaite) */
    @Column(nullable = false) private int score;
    @Column(nullable = false) private int ageReel;
    @Column(nullable = false) private int agePeau;
    @Column(nullable = false) private LocalDate dateAnalyse;
}
