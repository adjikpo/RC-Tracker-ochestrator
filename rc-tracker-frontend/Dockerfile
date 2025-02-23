FROM node:16-alpine

WORKDIR /app
COPY rc_frontend/package*.json ./
RUN npm install
COPY rc_frontend/ .
EXPOSE 3000
CMD ["npm", "start"]


# Dockerfile de production 
# Étape 1 : Construire l'application React
# FROM node:16-alpine as build
# WORKDIR /app
# COPY package*.json ./
# RUN npm install && npm cache clean --force
# COPY . .
# RUN npm run build

# # Étape 2 : Servir l'application construite avec un serveur léger (Nginx)
# FROM nginx:alpine
# RUN chown -R nginx:nginx /usr/share/nginx/html
# COPY --from=build /app/build /usr/share/nginx/html
# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]