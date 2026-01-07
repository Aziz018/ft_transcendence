FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install
COPY . .
RUN mkdir -p src/generated && npx prisma generate

EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
