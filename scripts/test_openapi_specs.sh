#!/bin/bash

export DB_USERNAME=${1:-"root"}
export DB_PASSWORD=${2:-"root"}
export DB_NAME=${3:-"test"}
export DB_HOSTNAME=${4:-"127.0.0.1"}

mysql -u ${DB_USERNAME} -p"${DB_PASSWORD}" -e "CREATE DATABASE IF NOT EXISTS ${DB_NAME};"
mysql -u ${DB_USERNAME} -p"${DB_PASSWORD}" ${DB_NAME} < src/sql/create_story_table.sql

npm run start &
sleep 10  # Give the app time to start up
specs=("" "/hubbles_law")
for spec in "${specs[@]}"; do
  url="http://localhost:8080${spec}/docs.json"
  echo $url
  DATA=$(curl $url)
  RESULT=$(curl -X "POST" \
    -H "Content-Type: application/json" \
    -d "$DATA" \
    https://validator.swagger.io/validator/debug)
  echo $RESULT
  echo $RESULT | jq -e '. == {}'
done 
pkill -f node
mysql -u ${DB_USERNAME} -p"${DB_PASSWORD}" -e "DROP DATABASE ${DB_NAME};"
