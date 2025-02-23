# RC-Tracker-ochestrator

RC Tracker est une application full-stack pour suivre et gérer des habitudes personnelles, avec une interface utilisateur en React et un backend en Django, le tout conteneurisé avec Docker.

## Structure du projet
RC-Tracker-ochestrator/
├── docker-compose.yml      # Configuration Docker
├── rc-tracker-backend/     # Backend Django
│   ├── Dockerfile
│   ├── rc_tracker/         # Application Django principale
│   └── tracking/           # App Django pour les modèles et API
├── rc-tracker-frontend/    # Frontend React
│   ├── Dockerfile
│   └── rc_frontend/        # Projet React
├── Makefile                # Commandes utiles
├── README.md               # Ce fichier
└── .gitignore              # Fichier d’exclusion Git

## Prérequis
- Docker et Docker Compose installés sur votre machine.