#!/bin/bash

# http://stackoverflow.com/a/125340
# remove origin/ from branch name
SOURCE_BRANCH=${GIT_BRANCH#*/}

BUILD_VERSION=$(cat package.json | grep version | head -1 | awk -F: '{ print $2 }' | sed 's/[\",]//g' | tr -d '[[:space:]]')
ARTIFACTORY_REPO="podaac-ci.jpl.nasa.gov:5000"
PROJECT_NAME="oiip/oiip-data-viewer"
CONTAINER_NAME="oiip_oiip-data-viewer"
IMAGE_NAME="${ARTIFACTORY_REPO}/${PROJECT_NAME}:latest"
IMAGE_NAME_TAG="${ARTIFACTORY_REPO}/${PROJECT_NAME}/${BUILD_VERSION}:${BUILD_VERSION}-${BUILD_NUMBER}"
BUNDLE_NAME="oiip-data-viewer-${BUILD_VERSION}-${BUILD_NUMBER}"

if [[ -z "${SOURCE_BRANCH// }" ]]; then
  echo "Could not resolve branch. Exiting."
  exit 0
else
  echo "Building branch: ${SOURCE_BRANCH}"
fi

echo "Removing old tar balls..."
rm -f ./*.tar.gz;

echo "Installing dependencies..."
npm install

if [ ! $? -eq 0 ]; then
  echo "Install failed."
  exit 1
fi

echo "Building..."
npm run build

echo "Checking build..."
if [ ! -d "dist" ]; then
  echo "Build failed."
  exit 1
fi

echo "Checking if branch is master..."
if [[ "${SOURCE_BRANCH}" == "master" ]]; then
  echo "Removing build report..."
  rm dist/build-report.txt

  echo "Building docker image..."
  sudo docker build -t ${IMAGE_NAME} -f scripts/deployAssets/Dockerfile .

  echo "Tagging image..."
  sudo docker tag ${IMAGE_NAME} ${IMAGE_NAME_TAG}

  echo "Pushing image..."
  sudo docker push ${IMAGE_NAME}

  echo "Pushing image tag..."
  sudo docker push ${IMAGE_NAME_TAG}

  echo "Removing docker images..."
  sudo docker rmi ${IMAGE_NAME_TAG}
  sudo docker rmi ${IMAGE_NAME}

  echo "Creating bundle..."
  mkdir ${BUNDLE_NAME}

  echo "Copying assets to bundle..."
  cp -r dist ${BUNDLE_NAME}/oiip-data-viewer
  cp docker-compose.yml ${BUNDLE_NAME}/docker-compose.yml
  cp nginx.conf ${BUNDLE_NAME}/nginx.conf

  echo "Creating tar bundle..."
  tar czf ${BUNDLE_NAME}.tar.gz ${BUNDLE_NAME}

  echo "Removing bundle..."
  rm -rf ${BUNDLE_NAME}
fi

echo "Checking branches dir..."
if [ ! -d "branches" ]; then
  mkdir branches
fi

echo "Creating target branch directory branches/${SOURCE_BRANCH}..."
rm -rf branches/${SOURCE_BRANCH} && mv dist branches/${SOURCE_BRANCH}

echo "Moving branches to dist for image build..."
mv branches dist

echo "Clearing old containers and images..."
sudo docker ps | grep ${PROJECT_NAME} | awk '{print $1 }' | xargs -I {} sudo docker stop {}
sudo docker ps -a | grep ${PROJECT_NAME} | awk '{print $1 }' | xargs -I {} sudo docker rm {}
sudo docker images | grep ${PROJECT_NAME} | awk '{print $1":"$2}' | xargs -I {} sudo docker rmi {}

echo "Building docker image..."
sudo docker build -t ${PROJECT_NAME} -f scripts/deployAssets/Dockerfile .

echo "Moving dist back to branches..."
mv dist branches

echo "Starting container..."
sudo docker run -d -p 8102:80 --name ${CONTAINER_NAME} ${PROJECT_NAME}

exit 0
