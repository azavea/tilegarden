FROM lambci/lambda:build-nodejs10.x

RUN yum -y install jq

RUN curl -o- -L https://yarnpkg.com/install.sh | bash
ENV PATH="/root/.yarn/bin:/root/.config/yarn/global/node_modules/.bin:${PATH}"

# Copy files needed for installing packages first
COPY package.json yarn.lock /home/tiler/
WORKDIR /home/tiler

# install node modules
RUN yarn install

# Copy remaining files after package installation to benefit from layer caching
COPY . /home/tiler

CMD ["yarn", "dev"]
