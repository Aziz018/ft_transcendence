FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install
COPY . .
RUN npx prisma generate
RUN mkdir -p public/images

EXPOSE 3002

CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
