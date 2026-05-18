FROM node:20-alpine

WORKDIR /app

# Copiamos primero el package.json para aprovechar la caché de Docker
COPY package*.json ./

# Instalamos todo (aquí instalará pg, cors y express)
RUN npm install

# Copiamos el resto del código (server.js)
COPY . .

EXPOSE 5000

CMD ["npm", "start"]