FROM node:20-alpine AS jaggisbackend

# image:version-variant

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .



RUN npm run build


# distroless node    ---> gcr.io/distroless/nodejs18
# Distroless images contain only the runtime, not development tools.
# gcr.io/distroless/nodejs18 includes:
# Node runtime
# required libraries
# But does NOT include:
# npm
# shell (bash/sh)
# package manager
# debugging tools
# gcr.io is the domain used by Google Container Registry, Google’s container image storage service.

FROM node:20-alpine 

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

# Copy prisma schema needed for client generation
COPY prisma ./prisma

# Generate prisma client in runtime container
RUN npx prisma generate

COPY --from=jaggisbackend /app/dist ./dist

EXPOSE 3000

CMD ["node","dist/index.js"]
