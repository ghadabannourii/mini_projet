package tn.esprit.microservice.profilms.dto;

import lombok.Data;

/** Miroir de RoutineStep de routine-ms — utilisé par Feign */
@Data
public class StepDTO {
    private int order;
    private String category;
    private String productName;
    private String activeIngredient;
    private String notes;
}
