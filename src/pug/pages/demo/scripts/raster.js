"use-strict"

document.addEventListener('DOMContentLoaded', function pageLoaded() {
    var map = L.map('map', {
        center: [39.96,-75.15,],
        zoom: 15,
        minZoom: 13,
    });

    // add basemap
    var basemap = L.tileLayer('https://korona.geog.uni-heidelberg.de/tiles/roadsg/x={x}&y={y}&z={z}', {
        maxZoom: 19,
        attribution: 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });
    map.addLayer(basemap);

    var LAYER_DESCS = {
        'inlets': 'This point layer contains all the wastewater and stormwater inlets in Philadelphia with latitude and longitude coordinates. | <a href="https://www.opendataphilly.org/dataset/water-inlets">City of Philadelphia</a>',
        'street_centerline': 'Street centerlines. Used citywide as base layer for many purposes/applications. The street centerline is available for reference purposes only and does not represent exact engineering specifiactions. | <a href="https://www.opendataphilly.org/dataset/street-centerlines">City of Philadelphia</a>',
        'pwd_parcels': 'PWD stormwater billing parcels. The primary purpose of PWD_PARCEL layer is to calculate parcel-based stormwater charges for PWD customers under the new parcel-based stormwater billing program. | <a href="https://www.opendataphilly.org/dataset/pwd-stormwater-billing-parcels">City of Philadelphia</a>',
    }

    // dynamically set path based on host
    var PROD_PATH = 'https://d3hvvzen5hf4hb.cloudfront.net/';
    var DEV_PATH = 'http://localhost:3000/';
    var TILESERVER_PATH;
    var host = window.location.hostname;
    if (!host || host === 'localhost') TILESERVER_PATH = DEV_PATH;
    else TILESERVER_PATH = PROD_PATH;

    function makeLayer (layer) {
        return L.tileLayer(TILESERVER_PATH + 'tile/{z}/{x}/{y}.png?config=data-type-example&layers=["' + layer + '"]');
    }

    var currentLayer;
    document.getElementById("selector").addEventListener('change', function selectorChange (e) {
        map.removeLayer(currentLayer);
        currentLayer = makeLayer(this.value);
        map.addLayer(currentLayer);

        document.getElementById('dataDesc').innerHTML = LAYER_DESCS[this.value];
    })

    currentLayer = makeLayer('inlets');
    map.addLayer(currentLayer);
    document.getElementById('dataDesc').innerHTML = LAYER_DESCS['inlets'];
});
