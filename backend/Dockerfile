FROM node:18-alpine AS nodejaggi

WORKDIR /app

COPY package*.json ./

RUN npm install



COPY . .

RUN npm run build 

FROM nginx 