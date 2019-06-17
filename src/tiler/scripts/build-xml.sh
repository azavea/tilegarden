#!/usr/bin/env bash

# This script used to be more complicated, involving filling in environment variables.
# Now they stay variables until later in the process, but it's easier to keep this as a
# script than to put the command inline in the places where it's used, especially since
# it seems possible that it could change again.

carto "${1}"
