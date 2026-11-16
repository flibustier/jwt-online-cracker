#!/usr/bin/env sh

# abort on errors
set -e

cdate=$(date +"%m-%d-%Y")

yarn build

# Source maps go to Bugsink, not to the site
./sourcemaps.sh

cd dist

git add -A .
git commit -m $cdate

git push git@github.com:flibustier/jwt-online-cracker.git gh-pages

cd -
