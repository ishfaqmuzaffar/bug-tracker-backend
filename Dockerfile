FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN chmod +x ./node_modules/.bin/prisma && ./node_modules/.bin/prisma generate
RUN chmod +x ./node_modules/.bin/tsc && ./node_modules/.bin/tsc

CMD ["node", "dist/main.js"]