#!/usr/bin/env bash

set -ex

if [ -d test/acceptance/acceptance-tests ]; then
  rm -rf test/acceptance/acceptance-tests
fi

if [ "$1" == "production" ]; then
  git clone -b production --single-branch https://github.com/pelias/acceptance-tests.git test/acceptance/acceptance-tests
else
  git clone https://github.com/pelias/acceptance-tests.git test/acceptance/acceptance-tests
fi

cd test/acceptance/acceptance-tests
npm install

if [ "$1" == "production" ]; then
  node test -e prod
else
  node test -e stage
fi

cd ../../../ && rm -rf test/acceptance/acceptance-tests
