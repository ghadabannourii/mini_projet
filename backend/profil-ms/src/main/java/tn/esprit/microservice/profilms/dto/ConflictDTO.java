package tn.esprit.microservice.profilms.dto;

import lombok.Data;

/** Miroir de IngredientConflict de routine-ms — utilisé par Feign */
@Data
public class ConflictDTO {
    private String ingredientA;
    private String ingredientB;
    private String severity;
    private String recommendation;
}
