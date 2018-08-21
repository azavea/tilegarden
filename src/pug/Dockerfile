FROM node

RUN yarn global add pug-cli

COPY . /home/pug
WORKDIR /home/pug

ENTRYPOINT ["pug", "pages"]
