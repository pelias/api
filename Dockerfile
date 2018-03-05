# base image
FROM pelias/baseimage

# maintainer information
LABEL maintainer="pelias@mapzen.com"

EXPOSE 3100

# Where the app is built and run inside the docker fs
ENV WORK=/opt/pelias

# Used indirectly for saving npm logs etc.
ENV HOME=/opt/pelias

#Set geotrans IP
ENV GEOTRANS_IP=

WORKDIR ${WORK}
COPY . ${WORK}

# install required utilities
RUN apt-get update && \
    apt-get install -y vim curl

# install node 6.x
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash - && \
    apt-get install -y nodejs

# move original node and symlink
RUN mv /usr/local/bin/node /usr/local/bin/node.original

RUN ln -s /usr/bin/nodejs /usr/local/bin/node


# Build and set permissions for arbitrary non-root user
RUN npm install && \
  npm test && \
  chmod -R a+rwX .

# Run geotrans env variable script
#RUN . ./node_modules/geotrans-mgrs-converter/install.sh
# Don't run as root, because there's no reason to (https://docs.docker.com/engine/articles/dockerfile_best-practices/#user).
# This also reveals permission problems on local Docker.
RUN chown -R 9999:9999 ${WORK}
# USER 9999

# start service
CMD [ "npm", "start" ]




