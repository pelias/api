#!/bin/bash

# CLI arguments
LOCK_FILE=$0
BUILD_TYPE=$1
DESTINATION=$2

if [[ -z "${BUILD_TYPE}" || -z "${DESTINATION}" ]]; then
  echo "Missing input parameters, at least 2 required: build type, destination dir"
  exit 1;
fi

COMMIT_TAG=$(git rev-parse HEAD)
ENV_NAME=$(echo ${BUILD_TYPE} | cut -d - -f 1)
PKG_NAME=$(echo ${BUILD_TYPE} | cut -d - -f 2)

export PACKAGE_VERSION=$(jq -r .version package.json)
export PACKAGE_INSTANCES=$(cat ./deploy/package/${PKG_NAME}/instances.${ENV_NAME}.txt)

export PACKAGE_IMAGE_NAME="pelias-api/code"
export PACKAGE_IMAGE_TAG="v1-${COMMIT_TAG}"
export PACKAGE_READ_REGISTRY_PREFIX="registry.taxify.io/"
export PACKAGE_WRITE_REGISTRY_PREFIX="registry-upload.taxify.io/"
imageWithTag="${PACKAGE_WRITE_REGISTRY_PREFIX}${PACKAGE_IMAGE_NAME}:${PACKAGE_IMAGE_TAG}"

exec {lock_fd}<"${LOCK_FILE}" || (echo "Failed to acquire lock descriptor" && exit 1)
if flock -x -w 1200 "$lock_fd"; then

  if docker image inspect "${imageWithTag}" >/dev/null 2>&1 || docker image pull "${imageWithTag}" >/dev/null 2>&1
  then
    echo "Image already exists ${imageWithTag}"
  else
    docker build -t "${imageWithTag}" ./
    docker push ${imageWithTag}
  fi

 flock -u "$lock_fd"
else
  echo "Timeout while waiting for build to complete"
  exit 1
fi
