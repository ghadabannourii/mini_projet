# routine-ms — Microservice de gestion des routines de soin

Microservice NestJS du projet **SkinBeauty** — Application companion dermatologique.

## Stack technique

- **Runtime** : Node.js 20+
- **Framework** : NestJS 10.x
- **Base de données** : MongoDB 7 (via Mongoose)
- **Messagerie** : RabbitMQ (@golevelup/nestjs-rabbitmq)
- **Découverte de services** : Eureka (eureka-js-client)
- **Documentation** : Swagger (@nestjs/swagger)
- **Validation** : class-validator / class-transformer

## Architecture

```
src/
├── main.ts                          # Point d'entrée (HTTP + Eureka)
├── app.module.ts                    # Module racine
├── config/
│   ├── eureka.config.ts             # Enregistrement Eureka
│   └── rabbitmq.config.ts           # Configuration RabbitMQ
├── routines/                        # Module CRUD routines
│   ├── routines.controller.ts       # Endpoints REST
│   ├── routines.service.ts          # Logique métier
│   ├── schemas/routine.schema.ts    # Schéma Mongoose
│   └── dto/                         # DTOs validés
├── ai-engine/                       # Moteur IA (système expert)
│   ├── recommendation.service.ts    # Génération AM/PM
│   ├── conflict-detector.service.ts # Détection de conflits
│   └── knowledge-base/
│       └── ingredient-rules.ts      # Base de règles
├── messaging/                       # Consumers/Producer RabbitMQ
│   ├── analyse-consumer.service.ts  # analyse_terminee_queue
│   ├── profil-consumer.service.ts   # profil_maj_queue
│   └── conflict-producer.service.ts # conflit_detecte_queue
└── health/health.controller.ts      # GET /health
```

## Endpoints REST

| Méthode | Route                         | Description                              |
|---------|-------------------------------|------------------------------------------|
| POST    | /routines/generate            | Génère/régénère une routine via l'IA     |
| GET     | /routines                     | Liste toutes les routines (admin)        |
| GET     | /routines/user/:userId        | Routine complète d'un utilisateur        |
| GET     | /routines/user/:userId/conflicts | Conflits d'ingrédients d'un utilisateur |
| PUT     | /routines/user/:userId/steps  | Met à jour les étapes AM ou PM           |
| DELETE  | /routines/user/:userId        | Supprime la routine d'un utilisateur     |
| GET     | /routines/:id                 | Routine par _id MongoDB                  |
| GET     | /health                       | Statut du service                        |

## Queues RabbitMQ

| Queue                   | Rôle       | Payload                                      |
|-------------------------|------------|----------------------------------------------|
| analyse_terminee_queue  | Consumer   | { userId, skinScore, skinType, realAge, skinAge } |
| profil_maj_queue        | Consumer   | { userId, newSkinType }                      |
| conflit_detecte_queue   | Producer   | { userId, routineId, conflicts, severity }   |

## Lancement en local

### Prérequis

- Node.js 20+
- MongoDB en cours d'exécution sur le port 27017
- RabbitMQ en cours d'exécution sur le port 5672
- (Optionnel) Eureka sur le port 8761

### Installation

```bash
cd routine-ms
npm install
```

### Configuration

```bash
cp .env.example .env
# Éditer .env selon votre environnement
```

### Démarrage

```bash
# Développement (watch mode)
npm run start:dev

# Production
npm run build
npm run start:prod
```

### Documentation Swagger

Disponible sur : http://localhost:3001/api-docs

## Lancement avec Docker Compose

Depuis la racine du backend :

```bash
docker-compose up --build
```

## Logique du moteur IA

### Génération AM (routine du matin)

1. **Nettoyant doux** — toujours inclus
2. **Sérum Vitamine C** — si `skinScore < 70`
3. **Hydratant** — toujours inclus
4. **Écran solaire** — SPF 50 pour types I-II, SPF 30 pour types III-VI

### Génération PM (routine du soir)

1. **Nettoyant** — toujours inclus
2. **Traitement actif** — Rétinol si `skinScore < 50`, Niacinamide sinon
3. **Hydratant riche** — toujours inclus

### Détection de conflits

Les ingrédients actifs de toutes les étapes AM + PM sont comparés deux à deux
contre la base de règles. Si un conflit de sévérité `high` est trouvé,
un message est publié dans `conflit_detecte_queue`.
