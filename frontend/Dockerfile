# Stage 1: Build static assets
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency configs and install
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .
ENV VITE_API_BASE_URL=
RUN npm run build

# Stage 2: Serve assets with Nginx
FROM nginx:stable-alpine

# Copy build output to Nginx directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
