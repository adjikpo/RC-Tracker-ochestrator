.PHONY: makemigrations migrate runserver createsuperuser showtables resetdb cleanmigrations frontend-init frontend-build frontend-run frontend-start frontend-install all

# Backend commands
makemigrations:
	@echo "📦 Génération des migrations..."
	@docker compose run --rm rc_backend python manage.py makemigrations

migrate:
	@echo "🚀 Application des migrations..."
	@docker compose run --rm rc_backend python manage.py migrate

runserver:
	@echo "🌍 Démarrage du serveur Django..."
	@docker compose up rc_backend

createsuperuser:
	@docker compose run --rm rc_backend python manage.py createsuperuser

showtables:
	@echo "📊 Affichage des tables de la DB..."
	@docker compose exec rc_db psql -U rc_tracker -d rc_tracker -c "\dt"

resetdb:
	@echo "🧹 Réinitialisation de la base de données..."
	@docker compose run --rm rc_backend python manage.py flush --no-input
	@docker compose run --rm rc_backend python manage.py migrate
	@echo "✅ Base de données réinitialisée !"

cleanmigrations:
	@echo "🧹 Suppression des anciennes migrations et réinitialisation de la base..."
	@find ./rc-tracker-backend/tracking/migrations -type f -not -name '__init__.py' -delete
	@docker compose down -v
	@docker compose up -d rc_db
	@docker compose run --rm rc_backend python manage.py makemigrations
	@docker compose run --rm rc_backend python manage.py migrate
	@echo "✅ Base de données et migrations réinitialisées !"

# Frontend commands
frontend-init:
	@echo "🌟 Initialisation du projet React dans rc-tracker-frontend/rc_frontend..."
	@docker run --rm -v ./rc-tracker-frontend/rc_frontend:/app -w /app node:16-alpine sh -c "npx create-react-app . && npm install axios react-router-dom"

frontend-install:
	@echo "📦 Installation des dépendances frontend et configuration de Tailwind CSS/Radix UI..."
	@docker compose run --rm rc_frontend npm install
	@docker compose run --rm rc_frontend npm install --save-dev tailwindcss @tailwindcss/forms
	@docker compose run --rm rc_frontend npm install lucide-react @radix-ui/react-slot @radix-ui/react-button @radix-ui/react-form @radix-ui/react-card
	@docker compose run --rm rc_frontend npx tailwindcss init -p
	@docker compose run --rm rc_frontend sh -c "echo \"/** @type {import('tailwindcss').Config} */\\nmodule.exports = {\\n  content: [\\n    './src/**/*.{js,jsx,ts,tsx}',\\n  ],\\n  theme: {\\n    extend: {},\\n  },\\n  plugins: [\\n    require('@tailwindcss/forms'),\\n  ],\\n}\" > tailwind.config.js"
	@docker compose run --rm rc_frontend sh -c "echo \"@tailwind base;\\n@tailwind components;\\n@tailwind utilities;\" > src/index.css"
	@echo "✅ Tailwind CSS et Radix UI configurés !"

frontend-build:
	@echo "🏗️ Construction de l’image frontend..."
	@docker compose build rc_frontend

frontend-run:
	@echo "🌐 Démarrage du frontend..."
	@docker compose up rc_frontend

frontend-start:
	@echo "🌐 Démarrage du frontend avec hot reloading..."
	@docker compose up rc_frontend

all:
	@echo "🚀 Démarrage du backend et du frontend..."
	@docker compose up rc_backend rc_frontend