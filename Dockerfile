FROM pelias/libpostal_baseimage

ENV TINI_VERSION v0.19.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
RUN chmod +x /tini

RUN mkdir -p /var/log/esclient/
RUN chown pelias /var/log/esclient

USER pelias

# Where the app is built and run inside the docker fs
ENV WORK=/home/pelias
WORKDIR ${WORK}

# copy package.json first to prevent npm install being rerun when only code changes
COPY ./package.json ${WORK}
RUN npm install

COPY . ${WORK}

#  Copying pelias config file
ADD .circleci/pelias.json ${WORK}/pelias.json

ENV PELIAS_CONFIG=${WORK}/pelias.json

ENV PORT 3000
EXPOSE 3000

ENTRYPOINT ["/tini", "--", "node","/home/pelias/index.js"]
