FROM node:20-alpine

ENV TZ=Etc/GMT

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

EXPOSE 5060

CMD ["npm", "run", "start:prod"]