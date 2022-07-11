FROM node:12.16.3-stretch-slim  
# AS build

WORKDIR /frontend

COPY . .
COPY package.json .
RUN npm install

EXPOSE 3000

CMD [ "npm", "run", "dev"]