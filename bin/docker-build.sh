#!/bin/bash

set -e -u

REPO_NAME=taeram/ineffable
BUILD_DATE=$( date +"%Y-%m-%d-%H-%M-%S" )
VERSION=1.0.0

script_dir=$( dirname $( greadlink -f $0 ) )

curl --silent --location https://raw.githubusercontent.com/taeram/docker-python-wsgi/master/Dockerfile | \
docker build \
  --build-arg=BUILD_DATE="$BUILD_DATE" \
  --build-arg=VERSION="$VERSION" \
  --file=- \
  --tag=$REPO_NAME \
  $script_dir/../

docker push $REPO_NAME
