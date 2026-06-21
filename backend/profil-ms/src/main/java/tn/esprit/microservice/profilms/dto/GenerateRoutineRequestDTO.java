package tn.esprit.microservice.profilms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Payload envoyé à POST /routines/generate de routine-ms via Feign */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GenerateRoutineRequestDTO {
    private Long userId;
    private String skinType;
    private int skinScore;
    private int realAge;
    private int skinAge;
}
