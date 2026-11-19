#!/usr/bin/env sh

# abort on errors
set -e

cdate=$(date +"%m-%d-%Y")

yarn build

# Source maps go to Bugsink, not to the site
./sourcemaps.sh

cd dist

# The files of the previous builds stay a week, for the tabs opened before
../keep-old-assets.sh assets

git add -A .
git commit -m $cdate

git push git@github.com:flibustier/jwt-online-cracker.git gh-pages

cd -
