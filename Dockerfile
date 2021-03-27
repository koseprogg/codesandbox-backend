FROM node:alpine

WORKDIR /app

COPY ./package.json .
COPY ./package-lock.json .
RUN npm install


ENV NODE_ENV=production

COPY ./ .
EXPOSE 3000

ENTRYPOINT ["npm", "run", "server"]
