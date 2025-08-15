.PHONY: help install dev build preview docker-build docker-up docker-down docker-restart docker-logs clean clean-docker clean-all

# Variables
DOCKER_IMAGE_NAME = snake-game
DOCKER_CONTAINER_NAME = snake-game-demo
PORT = 3000

# Couleurs pour l'affichage
GREEN = \033[0;32m
YELLOW = \033[0;33m
RED = \033[0;31m
NC = \033[0m # No Color

# Commande par défaut
help:
	@echo "$(GREEN)╔══════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(GREEN)║                 🐍 Snake Game - Commandes                ║$(NC)"
	@echo "$(GREEN)╚══════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(YELLOW)📦 Installation et développement local:$(NC)"
	@echo "  make install       - Installer les dépendances npm"
	@echo "  make dev          - Lancer en mode développement (port 5173)"
	@echo "  make build        - Construire pour la production"
	@echo "  make preview      - Prévisualiser la version de production"
	@echo ""
	@echo "$(YELLOW)🐳 Docker:$(NC)"
	@echo "  make docker-build - Construire l'image Docker"
	@echo "  make up           - Lancer avec docker-compose"
	@echo "  make down         - Arrêter et supprimer les conteneurs"
	@echo "  make restart      - Redémarrer les conteneurs"
	@echo "  make logs         - Voir les logs du conteneur"
	@echo "  make docker-shell - Ouvrir un shell dans le conteneur"
	@echo ""
	@echo "$(YELLOW)🧹 Nettoyage:$(NC)"
	@echo "  make clean        - Nettoyer les fichiers de build et node_modules"
	@echo "  make clean-docker - Nettoyer les images et conteneurs Docker"
	@echo "  make clean-all    - Nettoyer tout (local + Docker)"
	@echo ""
	@echo "$(YELLOW)🚀 Raccourcis:$(NC)"
	@echo "  make start        - Alias pour 'make up'"
	@echo "  make stop         - Alias pour 'make down'"
	@echo ""

# Installation et développement local
install:
	@echo "$(GREEN)📦 Installation des dépendances...$(NC)"
	npm install
	@echo "$(GREEN)✅ Installation terminée!$(NC)"

dev:
	@echo "$(GREEN)🚀 Lancement en mode développement...$(NC)"
	@echo "$(YELLOW)📍 Application disponible sur http://localhost:5173$(NC)"
	npm run dev

build:
	@echo "$(GREEN)🔨 Construction pour la production...$(NC)"
	npm run build
	@echo "$(GREEN)✅ Build terminé! Fichiers dans ./dist$(NC)"

preview:
	@echo "$(GREEN)👁️  Prévisualisation de la version de production...$(NC)"
	npm run preview

# Docker
docker-build:
	@echo "$(GREEN)🐳 Construction de l'image Docker...$(NC)"
	docker build -t $(DOCKER_IMAGE_NAME) .
	@echo "$(GREEN)✅ Image Docker construite: $(DOCKER_IMAGE_NAME)$(NC)"

up: docker-build
	@echo "$(GREEN)🚀 Lancement avec docker-compose...$(NC)"
	docker-compose up -d
	@echo "$(GREEN)✅ Application lancée!$(NC)"
	@echo "$(YELLOW)📍 Accessible sur http://localhost:$(PORT)$(NC)"

down:
	@echo "$(YELLOW)⏹️  Arrêt des conteneurs...$(NC)"
	docker-compose down
	@echo "$(GREEN)✅ Conteneurs arrêtés et supprimés$(NC)"

restart:
	@echo "$(YELLOW)🔄 Redémarrage des conteneurs...$(NC)"
	docker-compose restart
	@echo "$(GREEN)✅ Conteneurs redémarrés$(NC)"

logs:
	@echo "$(YELLOW)📋 Logs du conteneur (Ctrl+C pour quitter):$(NC)"
	docker-compose logs -f

docker-shell:
	@echo "$(YELLOW)🐚 Ouverture d'un shell dans le conteneur...$(NC)"
	docker exec -it $(DOCKER_CONTAINER_NAME) /bin/sh

# Nettoyage
clean:
	@echo "$(RED)🧹 Nettoyage des fichiers locaux...$(NC)"
	rm -rf node_modules dist package-lock.json
	@echo "$(GREEN)✅ Nettoyage local terminé$(NC)"

clean-docker:
	@echo "$(RED)🐳 Nettoyage Docker...$(NC)"
	docker-compose down -v --rmi all
	@echo "$(GREEN)✅ Images et conteneurs Docker supprimés$(NC)"

clean-all: clean clean-docker
	@echo "$(GREEN)✅ Nettoyage complet terminé$(NC)"

# Alias
start: up
stop: down

# Installation rapide et lancement
quick-start: install dev

# Docker quick start
docker-start: docker-build up logs