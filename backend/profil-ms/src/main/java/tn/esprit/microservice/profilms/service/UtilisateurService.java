package tn.esprit.microservice.profilms.service;

import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import tn.esprit.microservice.profilms.config.RabbitMQConfig;
import tn.esprit.microservice.profilms.entity.Utilisateur;
import tn.esprit.microservice.profilms.repository.UtilisateurRepository;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

/**
 * Service métier pour la gestion des utilisateurs.
 * Gère le CRUD et la mise à jour du type de peau avec notification RabbitMQ.
 */
@Service
@RequiredArgsConstructor
public class UtilisateurService {

    private final UtilisateurRepository repository;
    private final RabbitTemplate rabbitTemplate;

    public List<Utilisateur> findAll() {
        return repository.findAll();
    }

    public Utilisateur findById(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new NoSuchElementException("Utilisateur introuvable : id=" + id));
    }

    public Utilisateur save(Utilisateur u) {
        return repository.save(u);
    }

    public Utilisateur update(Long id, Utilisateur updated) {
        Utilisateur existing = findById(id);
        existing.setNom(updated.getNom());
        existing.setPrenom(updated.getPrenom());
        existing.setEmail(updated.getEmail());
        existing.setTypePeau(updated.getTypePeau());
        return repository.save(existing);
    }

    public void delete(Long id) {
        findById(id); // lève 404 si absent
        repository.deleteById(id);
    }

    /**
     * Met à jour le type de peau, puis publie sur profil_maj_queue.
     *
     * Pourquoi RabbitMQ ici ? routine-ms doit réajuster l'écran solaire
     * (SPF50 vs SPF30) en fonction du nouveau type Fitzpatrick, sans que
     * profil-ms attende la réponse (communication asynchrone découplée).
     */
    public Utilisateur updateTypePeau(Long id, String newTypePeau) {
        Utilisateur u = findById(id);
        u.setTypePeau(newTypePeau);
        repository.save(u);

        // Publication sur profil_maj_queue — payload : { userId, newSkinType }
        Map<String, Object> payload = new HashMap<>();
        payload.put("userId", id);
        payload.put("newSkinType", newTypePeau);
        rabbitTemplate.convertAndSend(RabbitMQConfig.PROFIL_MAJ_QUEUE, payload);

        return u;
    }
}
