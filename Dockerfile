# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Copy config files to install dependencies
COPY package.json pnpm-lock.yaml ./

# Install pnpm and dependencies
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy the rest of the files and build the project
COPY . .
ARG APP_VERSION=0.1.0
ENV VITE_APP_VERSION=$APP_VERSION
RUN pnpm run build

# Production stage
FROM nginx:alpine
# Copy built React/Vite files to nginx serving folder
COPY --from=build /app/dist /usr/share/nginx/html
# Copy Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]