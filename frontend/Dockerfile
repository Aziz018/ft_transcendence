FROM node:22-bookworm AS base

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS development
COPY . .
# Expose Vite port
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]

FROM base AS builder
COPY . .
RUN npm run build

FROM nginx:stable-alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]
