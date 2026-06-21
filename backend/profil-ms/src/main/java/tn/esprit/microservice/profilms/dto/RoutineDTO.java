package tn.esprit.microservice.profilms.dto;

import lombok.Data;
import java.util.List;

/** Miroir du document Routine de routine-ms — reçu via Feign */
@Data
public class RoutineDTO {
    private String id;
    private Long userId;
    private String skinType;
    private List<StepDTO> amSteps;
    private List<StepDTO> pmSteps;
    private List<ConflictDTO> conflicts;
}
