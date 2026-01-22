FROM node:20-alpine AS builder

WORKDIR /app

COPY frontend/web/package*.json ./frontend/web/
COPY frontend/web/tsconfig.json ./frontend/web/
COPY frontend/web/vite.config.ts ./frontend/web/
COPY frontend/web/index.html ./frontend/web/
COPY frontend/web/src ./frontend/web/src

WORKDIR /app/frontend/web
ARG VITE_API_BASE_URL=http://localhost
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm install
RUN npm run build

FROM nginx:alpine

COPY frontend/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/frontend/web/dist /usr/share/nginx/html

EXPOSE 3000
