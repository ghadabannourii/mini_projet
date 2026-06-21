package tn.esprit.microservice.profilms.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.microservice.profilms.entity.AlerteConflit;
import java.util.List;

@Repository
public interface AlerteConflitRepository extends JpaRepository<AlerteConflit, Long> {
    List<AlerteConflit> findByUtilisateurId(Long utilisateurId);
}
