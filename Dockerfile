#FROM mhart/alpine-node:16
FROM node:18.10.0-alpine
LABEL maintainer="k8debug"

RUN mkdir /vpk
RUN mkdir /vpk/cluster
RUN mkdir /vpk/usage

WORKDIR /vpk
COPY lib/ ./lib
COPY public/ ./public
COPY server.js .
COPY userconfig.json .
COPY vpkconfig.json .
COPY package.json .

RUN apk add --no-cache nano \
    && npm install

CMD ["npm", "start"]
EXPOSE 4200/tcp

#docker run -it dweilert/vpk sh
#docker container  run -v /Users/bob/cluster/:/vpk/cluster -p 4200:4200 dweilert/vpk
#docker tag k8debug/vpk:5.2.0 k8debug/vpk:latest