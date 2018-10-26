FROM node:8.2.1
MAINTAINER Rutebanken

RUN wget --quiet https://github.com/Yelp/dumb-init/releases/download/v1.0.1/dumb-init_1.0.1_amd64.deb
RUN dpkg -i dumb-init_*.deb
RUN npm set progress=false

# Install other dependencies:
RUN apt-get update
RUN apt-get install -y --no-install-recommends git unzip python python-dev python-pip python-virtualenv \
  build-essential software-properties-common curl wget apt-utils gdal-bin vim
RUN apt-get install curl autoconf automake libtool pkg-config

RUN mkdir -p /var/log/esclient/

# Install libpostal

RUN git clone https://github.com/openvenues/libpostal.git /root/.pelias/libpostal \
    cd /root/.pelias/libpostal \
    && ./bootstrap.sh \
    && ./configure --datadir=/root/.pelias/libpostal \
    && make \
    && make install \
    && ldconfig

# Install node-gyp
RUN npm install -g node-gyp

# Install node bindings
RUN npm install openvenues/node-postal


# Install the pelias-api
COPY . /root/.pelias/pelias-api
RUN cd /root/.pelias/pelias-api \
	&& npm install \
	&& ln -s /root/.pelias/pelias-api/public /root/public

## setting workdir
WORKDIR /root

#  Copying pelias config file
ADD .circleci/pelias.json pelias.json

ENV PORT 3000
EXPOSE 3000

CMD [ "dumb-init","node","/root/.pelias/pelias-api/index.js" ]

# Can be run with:
# docker run -it --rm -e NODE_ENV=dev --link elasticsearch:pelias-es eu.gcr.io/carbon-1287/pelias:latest
# Notice that it bombs with NODE_ENV=production
