# Usar una imagen base de Node.js
FROM node:20.9.0

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar el archivo package.json
COPY package*.json ./
COPY server.js ./

# Instalar dependencias
RUN npm install

# Copiar el resto del proyecto
COPY . .

# Exponer el puerto que la aplicación usará
EXPOSE 5000

# Comando para iniciar la aplicación
CMD ["node", "server.js"]