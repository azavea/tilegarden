#!/usr/bin/env bash

set -e

function usage() {
    echo -n "Usage: $(basename "${0}") Deploys the contents of the container to AWS
    --help      Display this help text
"
}

function main() {
    if [ "${1}" = "--new" ]
    then
        yarn deploy-new
    else
        yarn deploy
    fi

    terraform init
    TF_VAR_source_id=$(jq -r '.api.id' claudia.json > .api-id) \
    TF_VAR_region=${LAMBDA_REGION} \
    TF_VAR_source_name=${PROJECT_NAME} \
    terraform apply -auto-approve

    echo "Success! Your tiles will be available at the above URL shortly."
}

if [ "${BASH_SOURCE[0]}" = "${0}" ]
then
    if [ "${1:-}" = "--help" ]
    then
        usage
    else
        main "${1}"
    fi
    exit
fi
