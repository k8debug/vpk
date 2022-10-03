#FROM mhart/alpine-node:16
FROM node:18.10.0
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

RUN apt-get install -y  curl \
    && npm install \
    && curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl" \ 
    && install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl  

CMD ["npm", "start"]
EXPOSE 4200/tcp

#docker run -it dweilert/vpk sh
#docker run -v /Users/bob/cluster/:/vpk/cluster -p 4200:4200 dweilert/vpk
#docker tag k8debug/vpk:5.2.0 k8debug/vpk:latest