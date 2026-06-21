package tn.esprit.microservice.profilms.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Endpoint de vérification du Config Server.
 * GET /welcome → retourne welcome.message injecté depuis config-server
 * via Spring Cloud Config.
 */
@RestController
public class WelcomeController {

    @Value("${welcome.message:Message non configure}")
    private String welcomeMessage;

    @GetMapping("/welcome")
    public String welcome() {
        return welcomeMessage;
    }
}
