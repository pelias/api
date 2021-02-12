FROM pelias/libpostal_baseimage

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

CMD ["node","/home/pelias/index.js" ]
