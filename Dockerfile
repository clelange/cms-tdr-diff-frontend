FROM node:24-alpine

ARG SNAPSHOT="local"
ARG BUILD_DATE=""
ENV BUILD_HASH=$SNAPSHOT
ENV BUILD_DATE=$BUILD_DATE
ENV BACKEND_URL=http://localhost:8000/
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

RUN npm run build
EXPOSE 3000
ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=3000
CMD ["node", ".output/server/index.mjs"]
