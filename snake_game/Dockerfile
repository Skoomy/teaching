# Build stage
FROM node:18-alpine AS builder

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci

# Copier tous les fichiers du projet
COPY . .

# Construire l'application pour la production
RUN npm run build

# Production stage
FROM node:18-alpine

# Installer serve pour servir l'application statique
RUN npm install -g serve

# Créer un utilisateur non-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers construits depuis le stage builder
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist

# Utiliser l'utilisateur non-root
USER nodejs

# Exposer le port 3000
EXPOSE 3000

# Commande pour démarrer l'application
CMD ["serve", "-s", "dist", "-l", "3000"]