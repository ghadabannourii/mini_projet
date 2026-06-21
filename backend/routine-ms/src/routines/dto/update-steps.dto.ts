import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsArray,
  ValidateNested,
  IsNumber,
  IsString,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO représentant une étape individuelle de routine.
 * Utilisé pour la mise à jour manuelle des étapes AM ou PM.
 */
export class RoutineStepDto {
  @ApiProperty({ description: "Ordre d'application", example: 1 })
  @IsNumber()
  order: number;

  @ApiProperty({
    description: 'Catégorie du produit',
    enum: ['cleanser', 'serum', 'moisturizer', 'sunscreen', 'treatment', 'toner'],
    example: 'cleanser',
  })
  @IsEnum(['cleanser', 'serum', 'moisturizer', 'sunscreen', 'treatment', 'toner'])
  category: string;

  @ApiProperty({ description: 'Nom du produit', example: 'Nettoyant doux à la glycérine' })
  @IsString()
  productName: string;

  @ApiProperty({
    description: 'Ingrédient actif principal',
    example: 'Hyaluronic Acid',
  })
  @IsString()
  activeIngredient: string;

  @ApiProperty({
    description: "Notes d'application",
    example: 'Appliquer sur peau humide',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

/**
 * DTO de mise à jour des étapes AM ou PM.
 * Reçu via PUT /routines/user/:userId/steps
 */
export class UpdateStepsDto {
  @ApiProperty({
    description: 'Période de la journée à mettre à jour',
    enum: ['AM', 'PM'],
    example: 'AM',
  })
  @IsEnum(['AM', 'PM'], {
    message: "period doit être 'AM' ou 'PM'",
  })
  period: 'AM' | 'PM';

  @ApiProperty({
    description: 'Nouvelles étapes à enregistrer',
    type: [RoutineStepDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoutineStepDto)
  steps: RoutineStepDto[];
}
