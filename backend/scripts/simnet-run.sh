#!/usr/bin/env bash
set -e

# install jq, which is a command line JSON processor used in this project
if hash jq 2>/dev/null; then
    echo jq already installed
else
    case "$OSTYPE" in
      darwin*)  brew install jq ;;
      linux*)   sudo apt-get install jq ;;
      msys*)    chocolatey install jq ;;
      *)        echo "unknown: $OSTYPE" ;;
    esac
fi

# start containers in test suite
docker-compose up -d simnet-btcd && sleep 5

# generate blocks to fund alice's wallet
docker-compose run simnet-btcctl generate 1 > /dev/null && sleep 5

docker-compose up -d simnet-lnd-btcd-alice
docker-compose up -d simnet-lnd-btcd-bob
# docker-compose up -d simnet-lnd-btcd-hoang
docker-compose up -d simnet-lnd-btcd-charlie && sleep 5
