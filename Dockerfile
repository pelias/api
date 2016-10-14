FROM node:0.12
MAINTAINER Pelias

ENV PORT=8080
EXPOSE ${PORT}

# use our extended query module until it gets merged upstream
ENV QUERY=/opt/pelias/query
WORKDIR ${QUERY}
RUN git clone --single-branch https://github.com/HSLdevcom/query.git \
  && cd query \
  && npm install \
  && npm link

# Where the app is built and run inside the docker fs
ENV WORK=/opt/pelias/api

# Used indirectly for saving npm logs etc.
ENV HOME=/opt/pelias/api

WORKDIR ${WORK}
ADD . ${WORK}

# Build and set permissions for arbitrary non-root user
RUN npm install \
  && npm link pelias-query \
  && npm test \
  && chmod -R a+rwX .

ADD pelias.json.docker pelias.json

CMD npm start
