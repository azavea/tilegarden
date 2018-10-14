#!/usr/bin/env bash

set -e

function usage() {
    echo -n "Usage: $(basename "${0}") [input directory] [output directory]
Transpiles a directory's worth of MML+MSS files into Tilegarden-readable XML
Options:
    --help      Display this help text
"
}

function main() {
    for file in $(echo "${1}/*")
    do
        ext="${file#*.}"
        if [ "$ext" == "json" ]; then
            # get output path
            filename="${file##*/}"
            base="${filename%%.*}"
            outPath="${2}/${base}.xml"

            mkdir -p ${2}

            echo "Transpiling ${file} => ${outPath}"
            ./scripts/build-xml.sh "${file}" > ${outPath}
        fi
    done
}

if [ "${BASH_SOURCE[0]}" = "${0}" ]
then
    if [ "${1:-}" = "--help" ]
    then
        usage
    else
        main "$1" "$2"
    fi
    exit
fi
