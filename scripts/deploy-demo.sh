#!/usr/bin/env bash

set -e

# Merge the current branch into gh-pages
# keep track of current branch
CURRENT_BRANCH=$(git rev-parse HEAD)

# First we have to clone the entire repo
REPO_TEMP=$(mktemp -d)
git clone https://github.com/azavea/tilegarden.git "${REPO_TEMP}"
cp .env "${REPO_TEMP}"
cd "${REPO_TEMP}"

# checkout gh-pages and merge
git checkout gh-pages
echo "Merging with ${CURRENT_BRANCH}"
git merge "${CURRENT_BRANCH}"
# make sure there wasn't a merge conflict
# exit if there's a merge conflict, this can be handled
# normally, but the actual tests haven't failed
if [[ $(git ls-files -u) ]]; then
	echo "WARNING: Merge conflict! This branch must have its conflicts resolved manually before deployment."
	exit 0
fi

# push
PUSH_URI="https://${GITHUB_TOKEN}@github.com/azavea/tilegarden.git"
echo "Pushing to origin"
git push "${PUSH_URI}" >/dev/null 2>&1 # don't print secrets

# Publish to AWS
./scripts/publish
