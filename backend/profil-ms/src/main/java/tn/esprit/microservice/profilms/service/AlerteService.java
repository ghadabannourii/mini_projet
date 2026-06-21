package tn.esprit.microservice.profilms.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.microservice.profilms.entity.AlerteConflit;
import tn.esprit.microservice.profilms.repository.AlerteConflitRepository;
import java.util.List;

/** Service métier pour la lecture des alertes de conflits reçues via RabbitMQ */
@Service
@RequiredArgsConstructor
public class AlerteService {

    private final AlerteConflitRepository repository;

    public List<AlerteConflit> findAll() { return repository.findAll(); }

    public List<AlerteConflit> findByUtilisateurId(Long userId) {
        return repository.findByUtilisateurId(userId);
    }
}
