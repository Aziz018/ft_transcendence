#!/bin/bash

npm init -y
npm install --save-dev typescript ts-node @types/node
npm install --save-dev ts-node-dev
npx tsc --init
npm install fastify
npm install @prisma/client
npm install --save-dev prisma
npx prisma init --datasource-provider sqlite
npx prisma migrate dev --name init
