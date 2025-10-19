FROM node:18-alpine AS builder

WORKDIR /app

RUN apk add --no-cache --virtual .gyp python3 make g++

COPY package.json package-lock.json* ./

RUN npm ci --silent

COPY . .

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
RUN npm run build

FROM nginx:stable-alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html

COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
