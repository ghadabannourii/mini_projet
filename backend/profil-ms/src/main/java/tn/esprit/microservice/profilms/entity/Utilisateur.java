package tn.esprit.microservice.profilms.entity;

import jakarta.persistence.*;
import lombok.*;

/** Entité JPA — utilisateur DeepSkyn. typePeau = échelle Fitzpatrick I à VI. */
@Entity @Table(name = "utilisateurs")
@Data @NoArgsConstructor @AllArgsConstructor
public class Utilisateur {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false) private String nom;
    @Column(nullable = false) private String prenom;
    @Column(nullable = false, unique = true) private String email;
    /** Type Fitzpatrick : I, II, III, IV, V ou VI */
    @Column(nullable = false) private String typePeau;
}
