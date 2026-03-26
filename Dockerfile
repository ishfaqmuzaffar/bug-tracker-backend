FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Fix Prisma permission
RUN chmod +x ./node_modules/.bin/prisma && ./node_modules/.bin/prisma generate

# Fix TypeScript permission
RUN chmod +x ./node_modules/.bin/tsc && ./node_modules/.bin/tsc

CMD ["node", "dist/main.js"]