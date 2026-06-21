package tn.esprit.microservice.profilms.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.microservice.profilms.entity.AnalyseCutanee;
import java.util.List;

@Repository
public interface AnalyseCutaneeRepository extends JpaRepository<AnalyseCutanee, Long> {
    /** Retourne toutes les analyses d'un utilisateur, triées par date DESC */
    List<AnalyseCutanee> findByUtilisateurIdOrderByDateAnalyseDesc(Long utilisateurId);
    List<AnalyseCutanee> findByUtilisateurId(Long utilisateurId);
}
