package tn.esprit.microservice.profilms.controller;

import feign.FeignException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.microservice.profilms.dto.ConflictDTO;
import tn.esprit.microservice.profilms.dto.GenerateRoutineRequestDTO;
import tn.esprit.microservice.profilms.dto.RoutineDTO;
import tn.esprit.microservice.profilms.entity.AnalyseCutanee;
import tn.esprit.microservice.profilms.entity.Utilisateur;
import tn.esprit.microservice.profilms.feign.RoutineClient;
import tn.esprit.microservice.profilms.service.AnalyseService;
import tn.esprit.microservice.profilms.service.UtilisateurService;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

/**
 * Contrôleur REST — gestion des utilisateurs (base /utilisateurs).
 * Inclut les appels Feign synchrones vers ROUTINE-MS.
 */
@RestController
@RequestMapping("/utilisateurs")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UtilisateurController {

    private final UtilisateurService utilisateurService;
    private final AnalyseService analyseService;
    private final RoutineClient routineClient;

    @GetMapping
    public List<Utilisateur> getAll() { return utilisateurService.findAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(utilisateurService.findById(id));
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public Utilisateur create(@RequestBody Utilisateur u) { return utilisateurService.save(u); }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Utilisateur u) {
        try {
            return ResponseEntity.ok(utilisateurService.update(id, u));
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            utilisateurService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /** Met à jour le typePeau et publie sur profil_maj_queue */
    @PutMapping("/{id}/type-peau")
    public ResponseEntity<?> updateTypePeau(@PathVariable Long id,
                                             @RequestBody Map<String, String> body) {
        try {
            return ResponseEntity.ok(utilisateurService.updateTypePeau(id, body.get("typePeau")));
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /** Appel Feign synchrone → GET /routines/user/{userId} */
    @GetMapping("/{id}/routine")
    public ResponseEntity<?> getRoutine(@PathVariable Long id) {
        try {
            RoutineDTO routine = routineClient.getRoutine(id);
            return ResponseEntity.ok(routine);
        } catch (FeignException.NotFound e) {
            return ResponseEntity.status(404).body("Aucune routine trouvée pour cet utilisateur");
        } catch (Exception e) {
            return ResponseEntity.status(503).body("routine-ms indisponible : " + e.getMessage());
        }
    }

    /** Appel Feign synchrone → GET /routines/user/{userId}/conflicts */
    @GetMapping("/{id}/conflits")
    public ResponseEntity<?> getConflits(@PathVariable Long id) {
        try {
            List<ConflictDTO> conflicts = routineClient.getConflicts(id);
            return ResponseEntity.ok(conflicts);
        } catch (FeignException.NotFound e) {
            return ResponseEntity.status(404).body("Aucune routine trouvée pour cet utilisateur");
        } catch (Exception e) {
            return ResponseEntity.status(503).body("routine-ms indisponible : " + e.getMessage());
        }
    }

    /**
     * Appel Feign synchrone → POST /routines/generate.
     * Construit le payload à partir de la dernière analyse de l'utilisateur.
     */
    @PostMapping("/{id}/routine/regenerer")
    public ResponseEntity<?> regenererRoutine(@PathVariable Long id) {
        try {
            Utilisateur user = utilisateurService.findById(id);
            List<AnalyseCutanee> analyses = analyseService.findByUtilisateurId(id);
            if (analyses.isEmpty()) {
                return ResponseEntity.badRequest().body("Aucune analyse disponible pour générer une routine");
            }
            AnalyseCutanee derniere = analyses.get(0); // triées par date DESC
            GenerateRoutineRequestDTO req = new GenerateRoutineRequestDTO(
                id, user.getTypePeau(), derniere.getScore(),
                derniere.getAgeReel(), derniere.getAgePeau()
            );
            return ResponseEntity.ok(routineClient.generateRoutine(req));
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(503).body("routine-ms indisponible : " + e.getMessage());
        }
    }
}
