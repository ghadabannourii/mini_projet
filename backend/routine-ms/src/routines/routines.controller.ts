import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { RoutinesService } from './routines.service';
import { GenerateRoutineDto } from './dto/generate-routine.dto';
import { UpdateStepsDto } from './dto/update-steps.dto';

/**
 * Contrôleur REST exposant les endpoints de gestion des routines.
 *
 * Base path : /routines
 * Ces 8 routes sont figées par le contrat d'API SkinBeauty —
 * profil-ms les appelle via OpenFeign avec exactement ces chemins.
 */
@ApiTags('routines')
@Controller('routines')
export class RoutinesController {
  constructor(private readonly routinesService: RoutinesService) {}

  // ─── POST /routines/generate ────────────────────────────────
  @Post('generate')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Génère ou régénère une routine AM/PM personnalisée',
    description:
      'Appelle le moteur IA, détecte les conflits, sauvegarde en MongoDB. ' +
      'Publie dans conflit_detecte_queue si un conflit HIGH est détecté.',
  })
  @ApiBody({ type: GenerateRoutineDto })
  @ApiResponse({ status: 201, description: 'Routine générée avec succès' })
  @ApiResponse({ status: 400, description: 'Payload invalide' })
  async generate(@Body() dto: GenerateRoutineDto) {
    return this.routinesService.generateRoutine(dto);
  }

  // ─── GET /routines ──────────────────────────────────────────
  @Get()
  @ApiOperation({
    summary: 'Liste toutes les routines',
    description: 'Usage admin/démo — retourne toutes les routines en base.',
  })
  @ApiResponse({ status: 200, description: 'Liste des routines' })
  async findAll() {
    return this.routinesService.findAll();
  }

  // ─── GET /routines/user/:userId ─────────────────────────────
  // IMPORTANT : cette route doit être AVANT /routines/:id
  // sinon Express interpréterait "user" comme un :id
  @Get('user/:userId')
  @ApiOperation({
    summary: "Retourne la routine complète d'un utilisateur (AM + PM + conflits)",
  })
  @ApiParam({ name: 'userId', type: Number, description: 'ID utilisateur profil-ms' })
  @ApiResponse({ status: 200, description: 'Routine trouvée' })
  @ApiResponse({ status: 404, description: "Aucune routine pour cet utilisateur" })
  async findByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.routinesService.findByUserId(userId);
  }

  // ─── GET /routines/user/:userId/conflicts ───────────────────
  @Get('user/:userId/conflicts')
  @ApiOperation({
    summary: "Retourne uniquement les conflits d'ingrédients d'un utilisateur",
  })
  @ApiParam({ name: 'userId', type: Number })
  @ApiResponse({ status: 200, description: 'Liste des conflits détectés' })
  @ApiResponse({ status: 404, description: 'Routine introuvable' })
  async findConflicts(@Param('userId', ParseIntPipe) userId: number) {
    return this.routinesService.findConflictsByUserId(userId);
  }

  // ─── PUT /routines/user/:userId/steps ───────────────────────
  @Put('user/:userId/steps')
  @ApiOperation({
    summary: "Met à jour manuellement les étapes AM ou PM d'un utilisateur",
    description: "Les conflits sont recalculés après la mise à jour.",
  })
  @ApiParam({ name: 'userId', type: Number })
  @ApiBody({ type: UpdateStepsDto })
  @ApiResponse({ status: 200, description: 'Étapes mises à jour' })
  @ApiResponse({ status: 404, description: 'Routine introuvable' })
  async updateSteps(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: UpdateStepsDto,
  ) {
    return this.routinesService.updateSteps(userId, dto);
  }

  // ─── DELETE /routines/user/:userId ──────────────────────────
  @Delete('user/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Supprime la routine d'un utilisateur" })
  @ApiParam({ name: 'userId', type: Number })
  @ApiResponse({ status: 200, description: 'Routine supprimée' })
  @ApiResponse({ status: 404, description: 'Routine introuvable' })
  async deleteByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.routinesService.deleteByUserId(userId);
  }

  // ─── GET /routines/:id ──────────────────────────────────────
  // Cette route est en DERNIER pour ne pas capturer "user" ou "generate"
  @Get(':id')
  @ApiOperation({
    summary: 'Récupère une routine par son _id MongoDB',
  })
  @ApiParam({ name: 'id', type: String, description: 'ObjectId MongoDB' })
  @ApiResponse({ status: 200, description: 'Routine trouvée' })
  @ApiResponse({ status: 404, description: '_id introuvable' })
  async findById(@Param('id') id: string) {
    return this.routinesService.findById(id);
  }
}
