FROM node:8.10-slim

COPY . /home/tiler
WORKDIR /home/tiler

# install and update yarn
RUN npm install -g yarn
RUN yarn --version
RUN yarn install

CMD ["yarn", "dev"]
