FROM node:20 AS build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM nginx:stable
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
