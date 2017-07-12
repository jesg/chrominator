#!/bin/bash

rm -rf docs

./node_modules/.bin/documentation build lib/** -f html -o docs
