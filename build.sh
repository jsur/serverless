#!/bin/bash
set -e
set -o pipefail

instruction()
{
  echo "usage: ./build.sh deploy <env>"
  echo ""
  echo "env: eg. int, staging, prod, ..."
  echo ""
  echo "for example: ./deploy.sh int"
}

if [ $# -eq 0 ]; then
  instruction
  exit 1
# elif [ "$1" = "int-test" ] && [ $# -eq 1 ]; then
#  npm ci
#
#  npm run test:integration
# elif [ "$1" = "acceptance-test" ] && [ $# -eq 1 ]; then
#   npm ci
# 
#   npm run acceptance-test
elif [ "$1" = "deploy" ] && [ $# -eq 2 ]; then
  STAGE=$2

  npm ci
  'node_modules/.bin/sls' deploy -s $STAGE --verbose
else
  instruction
  exit 1
fi