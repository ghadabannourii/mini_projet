package tn.esprit.microservice.profilms.config;

import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration RabbitMQ pour profil-ms.
 *
 * Règle de déclaration des queues :
 *   "Celui qui consomme déclare la queue."
 *   → conflit_detecte_queue est déclarée ici (profil-ms est le consommateur)
 *   → analyse_terminee_queue et profil_maj_queue sont déclarées dans routine-ms
 *
 * Jackson2JsonMessageConverter : sérialise/désérialise les messages en JSON
 * automatiquement, sans avoir à appeler objectMapper.writeValueAsString() manuellement.
 */
@Configuration
public class RabbitMQConfig {

    /** Queue écoutée par profil-ms — publiée par routine-ms quand un conflit HIGH est détecté */
    public static final String CONFLIT_DETECTE_QUEUE = "conflit_detecte_queue";

    /** Queue publiée par profil-ms → consommée par routine-ms après une analyse */
    public static final String ANALYSE_TERMINEE_QUEUE = "analyse_terminee_queue";

    /** Queue publiée par profil-ms → consommée par routine-ms quand le typePeau change */
    public static final String PROFIL_MAJ_QUEUE = "profil_maj_queue";

    /**
     * Déclare conflit_detecte_queue comme durable (survit aux redémarrages RabbitMQ).
     * Profil-ms est le consommateur → c'est lui qui la déclare.
     */
    @Bean
    public Queue conflitDetecteQueue() {
        return new Queue(CONFLIT_DETECTE_QUEUE, true);
    }

    /** Convertisseur JSON pour RabbitTemplate — évite la sérialisation manuelle */
    @Bean
    public Jackson2JsonMessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    /** Configure RabbitTemplate pour utiliser le convertisseur JSON */
    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(messageConverter());
        return template;
    }
}
