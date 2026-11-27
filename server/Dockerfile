FROM node:25.6.1-alpine3.23

WORKDIR /server

RUN npm install -g pnpm@12.21.0

COPY package.json package.json
COPY pnpm-lock.yaml pnpm-lock.yaml
COPY pnpm-workspace.yaml pnpm-workspace.yaml
COPY prisma prisma

RUN pnpm i

COPY index.js index.js
COPY cloudinary.js cloudinary.js
COPY prisma.js prisma.js

EXPOSE 3000

CMD pnpm run dev