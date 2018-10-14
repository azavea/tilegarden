#!/usr/bin/env bash

# This script is never meant to be called directly by the user.
# It should only be called by other scripts that pass MML strings
# in to it, so that different environments can have access to the
# version of carto installed on the docker container.

function main() {
    base="${1%%.*}"
    rendered="${base}.rendered.mml"
    filled="${base}.filled.mml"

    handlebars "${1}" < /home/tiler/src/config/map-config.mml.hbs > "${rendered}"

    # fill in environment variables
    node scripts/template-vars.js "${rendered}" > "${filled}"

    # compile with carto
    carto "${filled}"

    # clean up
    rm "${rendered}" "${filled}"
}

main "${1}" "${2}"
