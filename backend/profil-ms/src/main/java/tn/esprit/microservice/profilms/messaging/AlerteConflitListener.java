package tn.esprit.microservice.profilms.messaging;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import tn.esprit.microservice.profilms.config.RabbitMQConfig;
import tn.esprit.microservice.profilms.entity.AlerteConflit;
import tn.esprit.microservice.profilms.repository.AlerteConflitRepository;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Consumer RabbitMQ — écoute conflit_detecte_queue.
 *
 * Payload reçu de routine-ms :
 *   { userId, routineId, conflicts: [{ingredientA, ingredientB, severity, recommendation}], severity }
 *
 * Action : crée et sauvegarde une AlerteConflit en base MySQL
 * pour permettre au front-end d'afficher l'historique des alertes.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AlerteConflitListener {

    private final AlerteConflitRepository alerteRepository;
    private final ObjectMapper objectMapper;

    @RabbitListener(queues = RabbitMQConfig.CONFLIT_DETECTE_QUEUE)
    @SuppressWarnings("unchecked")
    public void handleConflitDetecte(Map<String, Object> payload) {
        log.info("📥 Message reçu sur conflit_detecte_queue : {}", payload);
        try {
            Long userId = Long.valueOf(payload.get("userId").toString());
            String routineId = payload.get("routineId").toString();
            String severity = payload.get("severity").toString();

            // Construction du résumé textuel de chaque conflit
            List<String> details = new ArrayList<>();
            List<Map<String, Object>> conflicts =
                (List<Map<String, Object>>) payload.get("conflicts");

            if (conflicts != null) {
                for (Map<String, Object> c : conflicts) {
                    details.add(String.format("%s + %s → %s : %s",
                        c.get("ingredientA"), c.get("ingredientB"),
                        c.get("severity"), c.get("recommendation")));
                }
            }

            AlerteConflit alerte = new AlerteConflit(
                null, userId, routineId, severity, details, LocalDateTime.now()
            );
            alerteRepository.save(alerte);
            log.info("✅ AlerteConflit sauvegardée pour userId={}", userId);
        } catch (Exception e) {
            log.error("❌ Erreur lors du traitement du message conflit_detecte_queue", e);
        }
    }
}
