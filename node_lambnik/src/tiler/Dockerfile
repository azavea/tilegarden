FROM node:8.10-slim

# Copy files needed for installing packages first
COPY package.json yarn.lock /home/tiler/
WORKDIR /home/tiler

# install and update yarn
#RUN npm install -g yarn
#RUN yarn --version
RUN yarn install

# Copy remaining files after package installation to benefit from layer caching
COPY . /home/tiler

CMD ["yarn", "dev"]
