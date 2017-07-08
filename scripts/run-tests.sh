#!/bin/bash

node fixtures/run_server.js &

server_pid=$!

trap "kill $server_pid && echo killed mock server" SIGINT SIGTERM EXIT

export CHROMINATOR_MOCK_SERVER_BASE_URL='http://127.0.0.1:8080'

./node_modules/.bin/mocha

kill $server_pid
