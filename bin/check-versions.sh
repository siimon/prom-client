#!/bin/bash

set -e

INSTALLED_VERSION=`node -p -e "require('prom-client/package.json').version"`
LATEST_VERSION=`npm show prom-client version`

if [[ "$INSTALLED_VERSION" != "$LATEST_VERSION" ]]; then
	echo "You currently have prom-client@${INSTALLED_VERSION} in devDependencies, but you need to have prom-client@${LATEST_VERSION}.";
	echo 'Please run `npm install --save-dev --force prom-client`';
	exit 1
fi
