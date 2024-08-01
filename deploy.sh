#!/usr/bin/env sh

# abort on errors
set -e

cdate=$(date +"%m-%d-%Y")

yarn build

cd dist

git add -A .
git commit -m $cdate

git push git@github.com:flibustier/jwt-online-cracker.git gh-pages

cd -
