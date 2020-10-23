#!/bin/bash

set -e

echo "Pushing"
$(aws ecr --no-include-email get-login)
docker push "$DOCKER_REPOSITORY:$CIRCLE_BRANCH-$CIRCLE_SHA1"
