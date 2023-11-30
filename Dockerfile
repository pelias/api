# base image
FROM pelias/baseimage:node-v20
USER pelias

# change working dir
ENV WORKDIR /code/pelias/api
RUN mkdir -p ${WORKDIR}
WORKDIR ${WORKDIR}

# copy package.json first to prevent npm install being rerun when only code changes
COPY ./package.json ${WORKDIR}
RUN npm install

COPY . ${WORKDIR}

# only allow containers to succeed if tests pass
RUN npm test

# start service
CMD [ "./bin/start" ]
