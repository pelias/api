FROM node:0.12
MAINTAINER Pelias

ENV PORT=8080
EXPOSE ${PORT}

# Where the app is built and run inside the docker fs
ENV WORK=/opt/pelias

# Used indirectly for saving npm logs etc.
ENV HOME=/opt/pelias

WORKDIR ${WORK}
ADD . ${WORK}

# Build and set permissions for arbitary non-root user
RUN npm install && \
  npm test && \
  chmod -R a+rwX .

ADD pelias.json.docker pelias.json


CMD npm start
