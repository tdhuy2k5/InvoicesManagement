# ==============================================================================
# STAGE 1: Build Frontend Assets
# ==============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Install dependencies (including devDependencies for build)
RUN npm install

# Generate Prisma Client
RUN npx prisma generate

# Copy source code and configuration files
COPY . .

# Build production bundle to /app/dist
RUN npm run build

# ==============================================================================
# STAGE 2: Serve with Nginx
# ==============================================================================
FROM nginx:alpine

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
