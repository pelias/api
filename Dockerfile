# base image
FROM pelias/libpostal_baseimage

# maintainer information
LABEL maintainer="pelias@mapzen.com"

EXPOSE 3100

# Where the app is built and run inside the docker fs
ENV WORK=/opt/pelias

# Used indirectly for saving npm logs etc.
ENV HOME=/opt/pelias

WORKDIR ${WORK}
COPY . ${WORK}

# install node 8.x
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash - && \
    apt-get install -y nodejs

# remove old node reference
RUN rm /usr/local/bin/node && ln -s /usr/bin/nodejs /usr/local/bin/node

# Build and set permissions for arbitrary non-root user
RUN npm install && \
  npm test && \
  chmod -R a+rwX .

# Don't run as root, because there's no reason to (https://docs.docker.com/engine/articles/dockerfile_best-practices/#user).
# This also reveals permission problems on local Docker.
RUN chown -R 9999:9999 ${WORK}
USER 9999

# start service
CMD [ "npm", "start" ]
