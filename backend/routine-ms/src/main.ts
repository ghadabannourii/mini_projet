import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { initEureka } from './config/eureka.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ─── Validation globale des DTOs ───────────────────────────────
  // whitelist: supprime les propriétés non décorées
  // forbidNonWhitelisted: retourne 400 si des champs inconnus sont envoyés
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true, // convertit automatiquement les types (ex: string → number)
    }),
  );

  // ─── Documentation Swagger ─────────────────────────────────────
  const config = new DocumentBuilder()
    .setTitle('Routine MS API')
    .setDescription(
      'Microservice de gestion des routines de soin AM/PM - SkinBeauty',
    )
    .setVersion('1.0')
    .addTag('routines', 'Gestion des routines de soin')
    .addTag('health', 'Vérification de santé du service')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  // ─── Démarrage du serveur HTTP ─────────────────────────────────
  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`🚀 routine-ms démarré sur le port ${port}`);
  console.log(`📚 Swagger disponible sur http://localhost:${port}/api-docs`);

  // ─── Enregistrement Eureka (non bloquant) ─────────────────────
  // Si Eureka n'est pas disponible, on logue mais on ne plante pas
  try {
    initEureka();
  } catch (error) {
    console.error(
      "⚠️  Impossible de se connecter à Eureka — le service continue sans découverte",
      error,
    );
  }
}

bootstrap();
