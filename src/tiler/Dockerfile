FROM node:8.10-slim

# Install build dependencies
RUN apt-get update -y
RUN apt-get install git jq unzip python3 -y
RUN curl -O https://bootstrap.pypa.io/get-pip.py && python3 get-pip.py --user
ENV PATH="/root/.local/bin:${PATH}"
RUN pip install awscli --user --upgrade

# Install terraform for deployment
RUN wget https://releases.hashicorp.com/terraform/0.11.8/terraform_0.11.8_linux_amd64.zip && \
unzip terraform_0.11.8_linux_amd64.zip && \
mv terraform /usr/local/bin/

# Install carto from npm
RUN yarn global add carto

# Copy files needed for installing packages first
COPY package.json yarn.lock /home/tiler/
WORKDIR /home/tiler

# install node modules
RUN yarn install

# Copy remaining files after package installation to benefit from layer caching
COPY . /home/tiler

# Add scripts to PATH
ENV PATH="/home/tiler/scripts:${PATH}"

 # Tile server
EXPOSE 3000
 # Debugger
EXPOSE 9229

CMD ["yarn", "dev"]
