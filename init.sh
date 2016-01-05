#!/bin/sh

# to be able to pull future updates
git branch -m master gulp-setup
git remote rename origin gulp-setup
git checkout --orphan master

# empty readme
echo '# README' > readme.md
# remove this file
rm init.sh

# first commit
git add -A
git commit -m "init"

# install dependencies
npm i && bower i
