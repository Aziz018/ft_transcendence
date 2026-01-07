FROM node:18-alpine

RUN apk add --no-cache curl openssl

WORKDIR /usr/src/app

# Copy package files
COPY package.json package-lock.json* ./

# Install ALL dependencies (including dev for Prisma generation)
RUN npm ci

# Copy Prisma schema
COPY prisma ./prisma/

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Don't remove dev dependencies - we need prisma CLI for db push
# RUN npm prune --production

EXPOSE 3000

# Push schema to database and start server
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node dist/index.js"]
