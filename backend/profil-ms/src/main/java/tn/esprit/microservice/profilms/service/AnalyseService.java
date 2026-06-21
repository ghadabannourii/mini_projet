package tn.esprit.microservice.profilms.service;

import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import tn.esprit.microservice.profilms.config.RabbitMQConfig;
import tn.esprit.microservice.profilms.entity.AnalyseCutanee;
import tn.esprit.microservice.profilms.entity.Utilisateur;
import tn.esprit.microservice.profilms.repository.AnalyseCutaneeRepository;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

/**
 * Service métier pour la gestion des analyses cutanées.
 *
 * Après chaque sauvegarde d'analyse, un message est publié sur
 * analyse_terminee_queue pour que routine-ms génère automatiquement
 * la routine AM/PM personnalisée de l'utilisateur.
 */
@Service
@RequiredArgsConstructor
public class AnalyseService {

    private final AnalyseCutaneeRepository repository;
    private final UtilisateurService utilisateurService;
    private final RabbitTemplate rabbitTemplate;

    public List<AnalyseCutanee> findAll() { return repository.findAll(); }

    public AnalyseCutanee findById(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new NoSuchElementException("Analyse introuvable : id=" + id));
    }

    public List<AnalyseCutanee> findByUtilisateurId(Long userId) {
        return repository.findByUtilisateurIdOrderByDateAnalyseDesc(userId);
    }

    /**
     * Sauvegarde l'analyse et publie sur analyse_terminee_queue.
     *
     * Payload : { userId, skinScore, skinType, realAge, skinAge }
     * routine-ms consomme ce message pour déclencher la génération
     * de la routine via son moteur IA à base de règles.
     */
    public AnalyseCutanee save(AnalyseCutanee analyse) {
        Utilisateur user = utilisateurService.findById(analyse.getUtilisateur().getId());
        analyse.setUtilisateur(user);
        AnalyseCutanee saved = repository.save(analyse);

        // Publication asynchrone — routine-ms n'a pas besoin de répondre
        Map<String, Object> payload = new HashMap<>();
        payload.put("userId", user.getId());
        payload.put("skinScore", saved.getScore());
        payload.put("skinType", user.getTypePeau());
        payload.put("realAge", saved.getAgeReel());
        payload.put("skinAge", saved.getAgePeau());
        rabbitTemplate.convertAndSend(RabbitMQConfig.ANALYSE_TERMINEE_QUEUE, payload);

        return saved;
    }
}
