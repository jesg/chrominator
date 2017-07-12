#!/bin/bash

rm -rf docs

./node_modules/.bin/jsdoc --destination docs -r lib
