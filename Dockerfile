FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# ✅ FIXED LINE
RUN chmod +x ./node_modules/.bin/prisma && ./node_modules/.bin/prisma generate

RUN npm run build

CMD ["node", "dist/main.js"]