FROM node:alpine as base

WORKDIR /app

COPY package.json package-lock.json ./
RUN rm -rf node_modules && npm install

COPY . .
RUN npm run build

EXPOSE 80

CMD ["npm", "run", "start"]
