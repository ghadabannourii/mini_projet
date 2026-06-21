package tn.esprit.microservice.profilms.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import tn.esprit.microservice.profilms.entity.AlerteConflit;
import tn.esprit.microservice.profilms.service.AlerteService;
import java.util.List;

/** Contrôleur REST — lecture des alertes de conflits (base /alertes) */
@RestController
@RequestMapping("/alertes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AlerteController {

    private final AlerteService alerteService;

    @GetMapping
    public List<AlerteConflit> getAll() { return alerteService.findAll(); }

    @GetMapping("/utilisateur/{userId}")
    public List<AlerteConflit> getByUtilisateur(@PathVariable Long userId) {
        return alerteService.findByUtilisateurId(userId);
    }
}
