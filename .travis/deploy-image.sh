#!/usr/bin/env bash

set -e

# Builds and deploys tilegarden docker image
# Based off of the build/deployment scripts here: https://github.com/azavea/docker-windshaft

docker build -t quay.io/${TRAVIS_REPO_SLUG:0:6}/${TRAVIS_REPO_SLUG:14}:${TRAVIS_COMMIT:0:7} .
docker run --rm quay.io/${TRAVIS_REPO_SLUG:0:6}/${TRAVIS_REPO_SLUG:14}:${TRAVIS_COMMIT:0:7} yarn version
docker login -e . -p "${QUAY_PASSWORD}" -u "${QUAY_USER}" quay.io

if [ -z "${TRAVIS_TAG}" ]; then
  QUAY_TAG="${TRAVIS_COMMIT:0:7}"
else
  QUAY_TAG="${TRAVIS_TAG}"

  docker tag -f "quay.io/${TRAVIS_REPO_SLUG:0:6}/${TRAVIS_REPO_SLUG:14}:${TRAVIS_COMMIT:0:7}" "quay.io/${TRAVIS_REPO_SLUG:0:6}/${TRAVIS_REPO_SLUG:14}:${QUAY_TAG}"
fi

docker push "quay.io/${TRAVIS_REPO_SLUG:0:6}/${TRAVIS_REPO_SLUG:14}:${QUAY_TAG}"
docker tag -f "quay.io/${TRAVIS_REPO_SLUG:0:6}/${TRAVIS_REPO_SLUG:14}:${QUAY_TAG}" "quay.io/${TRAVIS_REPO_SLUG:0:6}/${TRAVIS_REPO_SLUG:14}:latest"
docker push "quay.io/${TRAVIS_REPO_SLUG:0:6}/${TRAVIS_REPO_SLUG:14}:latest"
