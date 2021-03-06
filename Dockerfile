FROM node:13.13.0-alpine

ARG SNAPSHOT="local"
ENV BUILD_HASH=$SNAPSHOT
ENV BACKEND_URL "http://localhost:8000/"
# RUN npm install -g http-server
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

RUN npm run build
EXPOSE 3000
ENV NUXT_HOST 0.0.0.0
CMD [ "npm", "start" ]
# CMD [ "npm", "run", "dev" ]