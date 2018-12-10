"use-strict"

document.addEventListener('DOMContentLoaded', function pageLoaded() {
    var map = L.map('map', {
        center: [39.97, -75.15], zoom: 11
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
        return L.tileLayer(TILESERVER_PATH + 'tile/{z}/{x}/{y}.png?config=data-type-example&layers=' + encodeURIComponent(JSON.stringify(filters)))
    }

    var EXAMPLE_PATH = 'https://yourtiles.cloudfront.net/tile/{z}/{x}/{y}.png?layers='

    var INITIAL_QUERY = [
        {
            name: 'pwd_parcels',
            mode: 'AND',
            filters: [
                {
                    col: 'owner2',
                    val: 'OF PHILADELPHIA',
                },
                {
                    col: 'gross_area',
                    op: '>',
                    val: '3000'
                }
            ]
        }
    ]

    // keep track of active layers so
    var currentSelection;
    document.getElementById("btnUpdateQuery").addEventListener('click', function selectorMouseUp() {
        // remove old layer
        map.removeLayer(currentSelection);

        // get new layer schema
        var layerObj;
        try {
            layerObj = JSON.parse(document.getElementById('querybox').value);
            currentSelection = newLayer(layerObj);
            currentSelection.addTo(map);
            document.getElementById('urlExample').innerText = EXAMPLE_PATH + JSON.stringify(layerObj);
        } catch (e) {
            console.error(e);
        }
    });

    currentSelection = newLayer(INITIAL_QUERY);
    document.getElementById('urlExample').innerText = EXAMPLE_PATH + JSON.stringify(INITIAL_QUERY);
    document.getElementById('querybox').value = JSON.stringify(INITIAL_QUERY, null, 2);
    map.addLayer(currentSelection);
});
