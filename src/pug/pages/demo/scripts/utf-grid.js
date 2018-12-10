"use-strict"

document.addEventListener('DOMContentLoaded', function pageLoaded() {
    var map = L.map('map', {
        center: [39.96, -75.15],
        zoom: 15,
    });

    // add basemap
    var basemap = L.tileLayer('https://korona.geog.uni-heidelberg.de/tiles/roadsg/x={x}&y={y}&z={z}', {
        maxZoom: 19,
        attribution: 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });
    map.addLayer(basemap);

    // dynamically set path based on host
    var PROD_PATH = 'https://d3hvvzen5hf4hb.cloudfront.net/';
    var DEV_PATH = 'http://localhost:3000/';
    var TILESERVER_PATH;
    var host = window.location.hostname;
    if (!host || host === 'localhost') TILESERVER_PATH = DEV_PATH;
    else TILESERVER_PATH = PROD_PATH;

    L.tileLayer(TILESERVER_PATH + 'tile/{z}/{x}/{y}.png?config=data-type-example&layers=["inlets"]').addTo(map);
    var grid = L.utfGrid(TILESERVER_PATH + 'grid/{z}/{x}/{y}?config=data-type-example&layers=["inlets"]&utfFields=owner,operator', { useJsonP: false })

    // keep track of currently active marker
    //var marker
    grid.on('mouseover', function gridClick(e) {
        if (e.data) {
            L.popup()
                .setLatLng(e.latlng)
                .setContent("This inlet is owned by " + e.data.owner + " and operated by " + e.data.operator + ".")
                .openOn(map)
        }
    })
    map.addLayer(grid);


    // prompt user to mouse over the map, remove mouseover div on mouseover
    document.getElementById('mousePrompt').addEventListener('mouseover', function onMouseOver() {
        this.parentNode.removeChild(this);
    })
});
