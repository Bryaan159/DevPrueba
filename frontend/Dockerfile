# Usa la imagen oficial de Nginx como base
FROM nginx:alpine
# Instala el paquete de desarrollo de OpenSSL
COPY . /usr/share/nginx/html

# Expon el puerto 80 para acceder al servidor web
EXPOSE 80

# Inicia el servicio de Nginx
CMD ["nginx", "-g", "daemon off;"]
