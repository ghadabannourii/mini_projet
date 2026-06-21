package tn.esprit.microservice.profilms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Entité JPA — alerte de conflit d'ingrédients.
 * Créée par AlerteConflitListener quand routine-ms publie sur conflit_detecte_queue.
 */
@Entity @Table(name = "alertes_conflits")
@Data @NoArgsConstructor @AllArgsConstructor
public class AlerteConflit {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false) private Long utilisateurId;
    @Column(nullable = false) private String routineId;
    @Column(nullable = false) private String severite;

    /** Détails textuels des conflits (ex: "Retinol + AHA/BHA : high") */
    @ElementCollection
    @CollectionTable(name = "alerte_details", joinColumns = @JoinColumn(name = "alerte_id"))
    @Column(name = "detail")
    private List<String> detailsConflits;

    @Column(nullable = false) private LocalDateTime dateAlerte;
}
