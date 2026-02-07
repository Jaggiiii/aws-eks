FROM node:20-alpine AS jaggisfrontned

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM nginx:alpine

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=jaggisfrontned /app/dist /usr/share/nginx/html



# Nginx runtime folder (PID, sockets)
# /run - temporary runtime files
# /usr/share/nginx/html - website static files served by nginx
# /var/cache/nginx - nginx cache and temp data
# /etc/nginx - nginx configuration files

COPY nginx.conf  /etc/nginx/conf.d/default.conf

RUN mkdir -p /run/nginx \
&& chown -R appuser:appgroup /run/nginx  \
/usr/share/nginx/html \
/var/cache/nginx \
/etc/nginx \
/run

USER  appuser

EXPOSE 80

CMD ["nginx","-g","daemon off;"]






