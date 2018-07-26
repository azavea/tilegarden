#!/usr/bin/env bash

# Fetches development data sets from OpenDataPhilly
if ! [ -f data/street_centerline.zip ]; then
    curl 'https://phila-gisdata.s3.amazonaws.com/ODP/STR_Centerline.zip' -L -o data/street_centerline.zip
fi

if ! [ -f data/pwd_parcels.zip ]; then
    curl 'http://gis.phila.gov/gisdata/ODP/PWD_Parcels.zip' -L -o data/pwd_parcels.zip
fi

if ! [ -f data/inlets.zip ]; then
    curl 'https://phl.carto.com/api/v2/sql?q=SELECT+*+FROM+inlets&filename=inlets&format=shp&skipfields=cartodb_id' -L -o data/inlets.zip
fi
