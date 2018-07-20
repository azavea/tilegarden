#!/usr/bin/env bash

# Fetches development data sets from OpenDataPhilly
curl 'https://phila-gisdata.s3.amazonaws.com/ODP/STR_Centerline.zip' --output data/STR_Centerline.zip
curl 'http://gis.phila.gov/gisdata/ODP/PWD_Parcels.zip' --output data/PWD_Parcels.zip
curl 'https://phl.carto.com/api/v2/sql?q=SELECT+*+FROM+inlets&filename=inlets&format=shp&skipfields=cartodb_id' --output data/inlets.zip
