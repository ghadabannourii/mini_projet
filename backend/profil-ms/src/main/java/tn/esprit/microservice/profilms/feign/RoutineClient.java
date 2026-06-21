package tn.esprit.microservice.profilms.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;
import tn.esprit.microservice.profilms.dto.ConflictDTO;
import tn.esprit.microservice.profilms.dto.GenerateRoutineRequestDTO;
import tn.esprit.microservice.profilms.dto.RoutineDTO;
import java.util.List;

/**
 * Client Feign — communication synchrone vers ROUTINE-MS.
 * Spring Cloud LoadBalancer résout "ROUTINE-MS" via Eureka.
 * Les 3 endpoints correspondent exactement aux routes de routines.controller.ts.
 */
@FeignClient(name = "ROUTINE-MS")
public interface RoutineClient {

    /** Récupère la routine complète (AM + PM + conflits) d'un utilisateur */
    @GetMapping("/routines/user/{userId}")
    RoutineDTO getRoutine(@PathVariable("userId") Long userId);

    /** Récupère uniquement le tableau des conflits d'ingrédients */
    @GetMapping("/routines/user/{userId}/conflicts")
    List<ConflictDTO> getConflicts(@PathVariable("userId") Long userId);

    /** Déclenche la (re)génération d'une routine via le moteur IA */
    @PostMapping("/routines/generate")
    RoutineDTO generateRoutine(@RequestBody GenerateRoutineRequestDTO request);
}
