"use-strict"
document.addEventListener('DOMContentLoaded', function onload() {
    mapboxgl.accessToken = "pk.eyJ1IjoibWRlbHNvcmRvLWF6YXZlYSIsImEiOiJjamp5Z3M5NTcwbHZpM3ZydzAxMXF3bWY5In0.GObbyRg_IX8mONaD98SIjQ"
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/light-v9',
        center: [ -75.15, 39.96,],
        zoom: 15,
        minZoom: 14,
    });

    // list of layers
    var layers = {
        'pwd_parcels': {
            id: 'pwd_parcels',
            type: 'fill',
            source: 'pwd_parcels',
            'source-layer': 'pwd_parcels',
            paint: {
                'fill-color': 'orange',
                'fill-outline-color': 'red',
            }
        },
        'street_centerline': {
            id: 'street_centerline',
            type: 'line',
            source: 'street_centerline',
            'source-layer': 'street_centerline',
            paint: {
                'line-color': 'red',
                'line-width': 2,
            }
        },
        'inlets': {
            id: 'inlets',
            type: 'circle',
            source: 'inlets',
            'source-layer': 'inlets',
            paint: {
                'circle-color': 'orange',
                'circle-stroke-color': 'red',
                'circle-stroke-width': 1
            }
        }
    }

    // dynamically set path based on host
    var PROD_PATH = 'https://d3hvvzen5hf4hb.cloudfront.net/';
    var DEV_PATH = 'http://localhost:3000/';
    var TILESERVER_PATH;
    var host = window.location.hostname;
    if (!host || host === 'localhost') TILESERVER_PATH = DEV_PATH;
    else TILESERVER_PATH = PROD_PATH;

    map.on('load', function mapLoaded() {
        map.addSource(
            'inlets',
            {
                type: 'vector',
                tiles: [TILESERVER_PATH+'vector/{z}/{x}/{y}?config=data-type-example&layers=["inlets"]']
            },
        )

        map.addSource(
            'street_centerline',
            {
                type: 'vector',
                tiles: [TILESERVER_PATH+'vector/{z}/{x}/{y}?config=data-type-example&layers=["street_centerline"]']
            },
        )

        map.addSource(
            'pwd_parcels',
            {
                type: 'vector',
                tiles: [TILESERVER_PATH+'vector/{z}/{x}/{y}?config=data-type-example&layers=["pwd_parcels"]']
            },
        )

        map.addLayer(layers['inlets'])
        document.getElementById('stylebox').value = JSON.stringify(layers['inlets'].paint)
        document.getElementById('dataDesc').innerHTML = LAYER_DESCS['inlets'];
    });

    var LAYER_DESCS = {
        'inlets': 'This point layer contains all the wastewater and stormwater inlets in Philadelphia with latitude and longitude coordinates. | <a href="https://www.opendataphilly.org/dataset/water-inlets">City of Philadelphia</a>',
        'street_centerline': 'Street centerlines. Used citywide as base layer for many purposes/applications. The street centerline is available for reference purposes only and does not represent exact engineering specifiactions. | <a href="https://www.opendataphilly.org/dataset/street-centerlines">City of Philadelphia</a>',
        'pwd_parcels': 'PWD stormwater billing parcels. The primary purpose of PWD_PARCEL layer is to calculate parcel-based stormwater charges for PWD customers under the new parcel-based stormwater billing program. | <a href="https://www.opendataphilly.org/dataset/pwd-stormwater-billing-parcels">City of Philadelphia</a>',
    }

    var currentLayer = 'inlets';
    document.getElementById("selector").addEventListener('change', function selectorChange (e) {
        var selection = document.getElementById("selector").value;
        console.log(JSON.stringify(selection));
        map.removeLayer(currentLayer);
        currentLayer = selection;
        map.addLayer(layers[currentLayer]);
        document.getElementById('stylebox').value = JSON.stringify(layers[selection].paint);
        document.getElementById('dataDesc').innerHTML = LAYER_DESCS[selection];
    });

    // update styles by looping through properties of json object
    document.getElementById('btnChangeStyle').addEventListener('click', function changeStyle() {
        var newStyle = JSON.parse(document.getElementById('stylebox').value);
        for (var p in newStyle) {
            if (newStyle.hasOwnProperty(p)) {
                map.setPaintProperty(currentLayer, p, newStyle[p]);
            }
        }
    });
});
