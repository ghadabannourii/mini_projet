# SkinBeauty — Companion Dermatologique IA

✨🌿 BeautySkyn🌿✨  🤖 AI-powered skincare companion    👤 Skin profile management  📊 Skin analysis tracking  🧴 Personalized skincare routines  🔒 Secure &amp; scalable microservices architecture    🚀 Spring Boot • NestJS • React • RabbitMQ • Keycloak • Docker
---

## Architecture globale

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
│                   TanStack Router + shadcn/ui                    │
│                         Port : 3000                              │
└─────────────────────┬───────────────────────────────────────────┘
                      │ HTTP/JWT
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│            GATEWAY Spring Cloud Gateway (port 9999)              │
│              Keycloak JWT + Role-Based Security                  │
│            ROLE_USER (lecture) / ROLE_ADMIN (écriture)          │
└──────────┬──────────────────────────────────┬───────────────────┘
           │ lb://PROFIL-MS                    │ lb://ROUTINE-MS
           ▼                                   ▼
┌──────────────────────┐          ┌───────────────────────────────┐
│  profil-ms (8081)    │          │     routine-ms (3001)          │
│  Spring Boot + MySQL │◄────────►│     NestJS + MongoDB          │
│  - Utilisateurs      │  Feign   │  - Routines AM/PM IA           │
│  - Analyses cutanées │  (sync)  │  - Moteur expert règles        │
│  - Alertes conflits  │          │  - Détecteur conflits          │
└──────────┬───────────┘          └─────────────┬─────────────────┘
           │                                     │
           └──────────┬──────────────────────────┘
                      │ RabbitMQ (async)
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    RabbitMQ (port 5672/15672)                     │
│  analyse_terminee_queue │ profil_maj_queue │ conflit_detecte_queue│
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────┐
│ Eureka :8761 │  │ Config :8888 │  │Keycloak:8099 │  │Prometheus│
│ (registre)   │  │ (config)     │  │ (auth/rôles) │  │  Grafana │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────┘
```

---

## Microservices

| Service | Technologie | Port | Base de données |
|---------|-------------|------|-----------------|
| eureka-server | Spring Boot | 8761 | — |
| config-server | Spring Boot | 8888 | — |
| profil-ms | Spring Boot + JPA | 8081 | MySQL (profil_db) |
| routine-ms | NestJS 10 | 3001 | MongoDB (routine-db) |
| gateway | Spring Cloud Gateway | 9999 | — |

---

## Communication entre microservices

### Synchrone — OpenFeign (profil-ms → routine-ms)

| Endpoint | Description |
|----------|-------------|
| `GET /routines/user/{userId}` | Récupère la routine complète AM/PM |
| `GET /routines/user/{userId}/conflicts` | Récupère les conflits d'ingrédients |
| `POST /routines/generate` | Génère/régénère une routine via le moteur IA |

### Asynchrone — RabbitMQ (3 queues)

| Queue | Producteur | Consommateur | Déclencheur |
|-------|------------|--------------|-------------|
| `analyse_terminee_queue` | profil-ms | routine-ms | POST /analyses |
| `profil_maj_queue` | profil-ms | routine-ms | PUT /utilisateurs/{id}/type-peau |
| `conflit_detecte_queue` | routine-ms | profil-ms | Conflit HIGH détecté |

---

## Sécurité — Keycloak

**Realm** : `DeepSkynRealm`  
**URL** : http://localhost:8099 (admin/admin)

### Rôles Keycloak

| Rôle | Droits |
|------|--------|
| `user` | Lecture seule (GET) sur tous les endpoints |
| `admin` | CRUD complet (POST, PUT, DELETE) |

### Configuration Keycloak (manuel après démarrage)

1. Créer le realm **DeepSkynRealm**
2. Créer les rôles : `user` et `admin`
3. Créer un client : `deepskyn-frontend` (type: public, PKCE)
4. Créer des utilisateurs et assigner les rôles

---

## Moteur IA — Génération de routine

### Règles de génération AM (matin)
1. **Nettoyant doux** — toujours
2. **Sérum Vitamine C** — si `skinScore < 70`
3. **Hydratant** — toujours
4. **SPF 50** si type Fitzpatrick I-II / **SPF 30** si III-VI

### Règles de génération PM (soir)
1. **Nettoyant** — toujours
2. **Rétinol** si `skinScore < 50` / **Niacinamide** sinon
3. **Hydratant riche** — toujours

### Détection de conflits d'ingrédients

| Ingrédient A | Ingrédient B | Sévérité | Action |
|-------------|-------------|----------|--------|
| Retinol | Vitamin C | medium | Utiliser à des moments différents |
| Retinol | AHA/BHA | **high** | Alterner les soirs → publie sur `conflit_detecte_queue` |
| Retinol | Benzoyl Peroxide | **high** | Ne jamais combiner → publie sur `conflit_detecte_queue` |
| Vitamin C | AHA/BHA | medium | Espacer l'application |
| Niacinamide | Vitamin C | low | Généralement compatible |

---

## Monitoring — Prometheus + Grafana

| Service | URL |
|---------|-----|
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3000 (admin/admin) |

Les métriques JVM et business sont exposées via `/actuator/prometheus` sur chaque service Spring Boot.

---

## Lancement

### Prérequis
- Docker Desktop ≥ 24
- Docker Compose ≥ 2.20

### Démarrage complet

```bash
cd backend
docker-compose up --build
```

### Vérifications

```bash
# Eureka Dashboard
open http://localhost:8761

# RabbitMQ Management
open http://localhost:15672

# Swagger routine-ms
open http://localhost:3001/api-docs

# Prometheus
open http://localhost:9090

# Grafana
open http://localhost:3000

# Test Config Server
curl http://localhost:8081/welcome

# Test Gateway (sans token → 401)
curl http://localhost:9999/utilisateurs
```

### Lancement individuel (dev local)

```bash
# Java (Maven)
cd backend/eureka-server && ./mvnw spring-boot:run
cd backend/config-server && ./mvnw spring-boot:run
cd backend/profil-ms     && ./mvnw spring-boot:run
cd backend/gateway       && ./mvnw spring-boot:run

# NestJS
cd backend/routine-ms && npm install && npm run start:dev

# Frontend
cd frontend && npm install && npm run dev
```

---

## CI/CD — GitHub Actions

Le pipeline `.github/workflows/ci-cd.yml` :
1. **Build Maven** de chaque service Java (matrix strategy)
2. **Build NestJS** de routine-ms
3. **Build frontend** React
4. **Docker push** vers Docker Hub (sur `main` uniquement)

---

## Structure du projet

```
SkinBeauty/
├── .github/
│   └── workflows/ci-cd.yml          # Pipeline CI/CD
├── backend/
│   ├── eureka-server/               # Registre de services
│   ├── config-server/               # Configuration centralisée
│   ├── profil-ms/                   # Spring Boot + MySQL
│   ├── routine-ms/                  # NestJS + MongoDB
│   ├── gateway/                     # API Gateway + Keycloak
│   ├── monitoring/
│   │   ├── prometheus.yml           # Config scraping métriques
│   │   └── grafana/                 # Datasources + dashboards
│   └── docker-compose.yml           # Orchestration complète
├── frontend/                        # React + TanStack Router
└── README.md                        # Ce fichier
```
