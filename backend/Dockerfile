FROM node:22-bookworm

WORKDIR /app

# Install dependencies first (caching)
COPY package.json package-lock.json ./
RUN npm ci

# Copy output (will be overridden by volume in dev usually, but good for build)
COPY . .

# Generate Client (needs to run after deps)
RUN npm run db:generate

# Expose port
EXPOSE 3030

# Default command (can be overridden in docker-compose)
CMD ["npm", "run", "dev"]