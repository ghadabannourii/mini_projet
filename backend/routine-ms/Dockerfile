# ─────────────────────────────────────────────
# Étape 1 : Build
# ─────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Installation de toutes les dépendances (dev incluses pour le build)
RUN npm install --legacy-peer-deps

# Copie du code source
COPY src/ ./src/

# Compilation TypeScript → JavaScript
RUN npm run build

# ─────────────────────────────────────────────
# Étape 2 : Production
# ─────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Copie uniquement les dépendances de production
COPY package*.json ./
RUN npm install --omit=dev --legacy-peer-deps
# Copie des artefacts compilés depuis l'étape de build
COPY --from=builder /app/dist ./dist

# Port exposé par le microservice
EXPOSE 3001

# Commande de démarrage en production
CMD ["node", "dist/main"]
