#!/usr/bin/env bash

# This script is never meant to be called directly by the user.
# It should only be called by other scripts that pass MML strings
# in to it, so that different environments can have access to the
# version of carto installed on the docker container.

function main() {
    tempFile="${1%%.*}.temp.mml"

    # fill in environment variables
    node scripts/template-vars.js "${2}" > ${tempFile}

    # compile with carto
    carto ${tempFile}

    # clean up
    rm ${tempFile}
}

main "${1}" "${2}"
