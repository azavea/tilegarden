FROM node:8.10-slim

# Install git for git dependencies
RUN apt-get update -y
RUN apt-get install git jq -y

# Copy files needed for installing packages first
COPY package.json yarn.lock /home/tiler/
WORKDIR /home/tiler

# install node modules
RUN yarn install

# Copy remaining files after package installation to benefit from layer caching
COPY . /home/tiler

CMD ["yarn", "dev"]
