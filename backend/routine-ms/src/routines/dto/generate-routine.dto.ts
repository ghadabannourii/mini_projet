import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsString,
  IsEnum,
  Min,
  Max,
  IsPositive,
} from 'class-validator';

/**
 * DTO de génération de routine.
 * Reçu depuis profil-ms via POST /routines/generate (OpenFeign)
 * ou depuis RabbitMQ (analyse_terminee_queue).
 */
export class GenerateRoutineDto {
  @ApiProperty({
    description: "Identifiant de l'utilisateur dans profil-ms",
    example: 1,
  })
  @IsNumber()
  @IsPositive()
  userId: number;

  @ApiProperty({
    description: 'Type Fitzpatrick de la peau (I = très clair, VI = très foncé)',
    enum: ['I', 'II', 'III', 'IV', 'V', 'VI'],
    example: 'II',
  })
  @IsString()
  @IsEnum(['I', 'II', 'III', 'IV', 'V', 'VI'], {
    message: 'skinType doit être I, II, III, IV, V ou VI (échelle Fitzpatrick)',
  })
  skinType: string;

  @ApiProperty({
    description: "Score de santé de la peau calculé par l'IA (0 = très abîmée, 100 = parfaite)",
    example: 65,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  skinScore: number;

  @ApiProperty({
    description: 'Âge réel de la personne',
    example: 28,
  })
  @IsNumber()
  @IsPositive()
  realAge: number;

  @ApiProperty({
    description: "Âge estimé de la peau par l'analyse IA",
    example: 32,
  })
  @IsNumber()
  @IsPositive()
  skinAge: number;
}
