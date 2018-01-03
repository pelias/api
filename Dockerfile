# base image
FROM pelias/libpostal_baseimage

# maintainer information
LABEL maintainer="pelias@mapzen.com"

EXPOSE 3100
EXPOSE 3150

# Where the app is built and run inside the docker fs
ENV WORK=/opt/pelias

# Used indirectly for saving npm logs etc.
ENV HOME=/opt/pelias

# Update git submodules
RUN git submodule update --init --recursive --remote

WORKDIR ${WORK}
COPY . ${WORK}


# Build and set permissions for arbitrary non-root user
RUN npm install && \
  npm test && \
  chmod -R a+rwX .



# Compile GeoTrans
RUN npm install --unsafe-perm geotrans-mgrs-converter
# Install node-gyp for GeoTrans
RUN npm install -g node-gyp
# Configure and build NBIND for Geotrans node module
RUN node-gyp configure build --directory=node_modules/geotrans-mgrs-converter/

# Run geotrans env variable script
#RUN . ./node_modules/geotrans-mgrs-converter/install.sh
# Don't run as root, because there's no reason to (https://docs.docker.com/engine/articles/dockerfile_best-practices/#user).
# This also reveals permission problems on local Docker.
RUN chown -R 9999:9999 ${WORK}
# USER 9999

