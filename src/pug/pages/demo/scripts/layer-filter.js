"use-strict"

document.addEventListener('DOMContentLoaded', function pageLoaded() {
    var map = L.map('map', {
        center: [39.99, -75.15], zoom: 11
    });

    // add basemap
    var basemap = L.tileLayer('https://korona.geog.uni-heidelberg.de/tiles/roadsg/x={x}&y={y}&z={z}', {
        maxZoom: 19,
        attribution: 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });
    map.addLayer(basemap)

    // dynamically set path based on host
    var PROD_PATH = 'https://d3hvvzen5hf4hb.cloudfront.net/';
    var DEV_PATH = 'http://localhost:3000/';
    var TILESERVER_PATH;
    var host = window.location.hostname;
    if (!host || host === 'localhost') TILESERVER_PATH = DEV_PATH;
    else TILESERVER_PATH = PROD_PATH;

    // add filtered layers
    function newLayer (filters) {
        return L.tileLayer(TILESERVER_PATH + 'tile/{z}/{x}/{y}.png?config=point-example&layers=' + filters)
    }

    var EXAMPLE_PATH = 'https://yourtiles.cloudfront.net/tile/{z}/{x}/{y}.png?layers='

    // keep track of active layers so
    var currentSelection;
    document.getElementById("selector").addEventListener('mouseup', function selectorMouseUp() {
        // remove old layer
        map.removeLayer(currentSelection);

        // get new layer names from selector
        var layerNames = Object.values(this.selectedOptions).map(function(v) {
            return '"' + v.value + '"';
        }).join(',');
        layerNames = "[" + layerNames + "]"

        currentSelection = newLayer(layerNames);
        currentSelection.addTo(map);
        document.getElementById('urlExample').innerText = EXAMPLE_PATH + layerNames;
    });

    currentSelection = newLayer('["PRIV","PARK"]');
    map.addLayer(currentSelection);
});
