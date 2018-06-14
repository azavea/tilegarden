FROM node:8.10-slim

COPY . usr/src
WORKDIR /usr/src/tiler

RUN yarn install
CMD ["yarn", "dev"]
