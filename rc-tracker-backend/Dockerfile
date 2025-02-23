# Utiliser l'image officielle de Python
FROM python:3.11.4-slim-buster

# Définir le répertoire de travail
WORKDIR /usr/src/app

# set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN apt-get update && apt-get install -y netcat gcc libpq-dev
# Copier le fichier requirements.txt (qui contient les dépendances)
RUN pip install --upgrade pip
COPY ./requirements.txt .
RUN pip install -r requirements.txt
RUN apt-get purge -y --auto-remove gcc && apt-get clean

COPY ./entrypoint.sh .
RUN sed -i 's/\r$//g' /usr/src/app/entrypoint.sh
RUN chmod +x /usr/src/app/entrypoint.sh

# Copier tous les fichiers du projet dans le conteneur
COPY . .

# CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
ENTRYPOINT ["/usr/src/app/entrypoint.sh"]
