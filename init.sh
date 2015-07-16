#!/bin/sh

# remove existing git history
rm -rf .git

# init anew
git init

# install dependencies
npm i && bower i
