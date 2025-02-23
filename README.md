# 🚀 RC Tracker Orchestrator

RC Tracker est une application de suivi des habitudes en équipe, développée avec un **backend Django** et un **frontend React**.

## 📦 Structure du Projet

- **rc-tracker-frontend/** → Contient le code du frontend (React)
- **rc-tracker-backend/** → Contient le code du backend (Django)
- **docker-compose.yml** → Configuration Docker pour exécuter l’application
- **Makefile** → Commandes utiles pour faciliter le développement

## 🛠️ Prérequis
Avant de commencer, assurez-vous d’avoir installé :
- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Make](https://www.gnu.org/software/make/)

## 🚀 Démarrer l’application
### 1️⃣ Cloner le projet
```sh
 git clone https://github.com/votre-repo/RC-Tracker-ochestrator.git
 cd RC-Tracker-ochestrator
```

### 2️⃣ Configurer l’environnement
Créer un fichier `.env.dev` dans `rc-tracker-backend/` et y ajouter :
```env
DATABASE=postgres
SQL_HOST=rc_db.internal
SQL_PORT=5432
POSTGRES_DB=rc_tracker
POSTGRES_USER=rc_tracker
POSTGRES_PASSWORD=1234
```

### 3️⃣ Démarrer l’application
```sh
make all
```
Ou démarrer chaque service individuellement :
```sh
docker compose up rc_db  # Démarrer la base de données
docker compose up rc_backend  # Démarrer le backend
docker compose up rc_frontend  # Démarrer le frontend
```

## 🎯 Commandes utiles
### Backend (Django)
| Commande | Description |
|----------|------------|
| `make makemigrations` | Générer les migrations |
| `make migrate` | Appliquer les migrations |
| `make runserver` | Démarrer le serveur Django |
| `make createsuperuser` | Créer un superutilisateur |
| `make resetdb` | Réinitialiser la base de données |
| `make cleanmigrations` | Supprimer les migrations et recréer la base |

### Frontend (React)
| Commande | Description |
|----------|------------|
| `make frontend-init` | Initialiser le projet React |
| `make frontend-install` | Installer les dépendances |
| `make frontend-build` | Construire l’image frontend |
| `make frontend-run` | Lancer le frontend |
| `make frontend-start` | Démarrer le frontend avec hot reloading |

## 📌 Déploiement
L’application est prévue pour être déployée sur **AWS** via une CI/CD. Plus d’infos à venir.

## 📝 Licence
Ce projet est sous licence MIT.

