FROM node:8.10-slim

# Copy files needed for installing packages first
COPY package.json yarn.lock claudia-local-api/ /home/tiler/
WORKDIR /home/tiler

# install node modules
RUN yarn install

# Copy remaining files after package installation to benefit from layer caching
COPY . /home/tiler

CMD ["yarn", "dev"]
