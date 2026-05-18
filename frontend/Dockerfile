# Usamos Node.js para construir y servir React
FROM node:20-alpine

WORKDIR /app

# Copiamos dependencias e instalamos
COPY package*.json ./
RUN npm install

# Copiamos el resto del código de React
COPY . .

# Exponemos el puerto de Vite
EXPOSE 5173

# Arrancamos exponiendo el host para que Docker lo detecte
CMD ["npm", "run", "dev", "--", "--host"]