package tn.esprit.microservice.profilms.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.microservice.profilms.entity.AnalyseCutanee;
import tn.esprit.microservice.profilms.service.AnalyseService;
import java.util.List;
import java.util.NoSuchElementException;

/**
 * Contrôleur REST — gestion des analyses cutanées (base /analyses).
 * POST /analyses → sauvegarde + publication sur analyse_terminee_queue.
 */
@RestController
@RequestMapping("/analyses")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AnalyseController {

    private final AnalyseService analyseService;

    @GetMapping
    public List<AnalyseCutanee> getAll() { return analyseService.findAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(analyseService.findById(id));
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/utilisateur/{userId}")
    public List<AnalyseCutanee> getByUtilisateur(@PathVariable Long userId) {
        return analyseService.findByUtilisateurId(userId);
    }

    /**
     * Crée une analyse et publie automatiquement sur analyse_terminee_queue
     * pour déclencher la génération de routine dans routine-ms.
     */
    @PostMapping
    public ResponseEntity<?> create(@RequestBody AnalyseCutanee analyse) {
        try {
            return ResponseEntity.status(201).body(analyseService.save(analyse));
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
