FROM node:lts-alpine3.23 AS builder

WORKDIR /app

COPY package.json .

RUN npm i

COPY . .

RUN npm run db:migrate

RUN npm run db:generate

CMD [ "npm", "run", "dev" ]

EXPOSE 3000