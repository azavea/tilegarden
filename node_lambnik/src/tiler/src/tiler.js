/**
 * Module that handles tile creation and other
 * map drawing functionality
 */

import mapnik from 'mapnik'
import SphericalMercator from '@mapbox/sphericalmercator'
import path from 'path'
import carto from 'carto'

import { readFile } from './util/fs-promise'

const TILE_HEIGHT = 256
const TILE_WIDTH = 256

const PROJECTION = '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs +over'

// Register plugins
mapnik.register_default_input_plugins()

/**
 * Converts z/x/y coordinates to a bounding box that can be used by a mapnik map
 * @param z (zoom)
 * @param x
 * @param y
 * @returns {*}
 */
const tileBounds = (z, x, y) => new SphericalMercator().bbox(x, y, z, false, process.env.EPSG)

/**
 * Return a promise that renders a utf grid for a given map coordinate
 * @param z
 * @param x
 * @param y
 * @returns {Promise<any>}
 */
export const grid = (z, x, y, utfFields) => {
    const grd = new mapnik.Grid(TILE_WIDTH, TILE_HEIGHT)

    return createMap(z, x, y)
        .then((map) => new Promise((resolve, reject) => {
            map.render(grd, {
                layer: 0,
                fields: utfFields,
            }, (err, rendered) => {
                if (err) reject(err)
                else resolve(rendered)
            })
        }))
        .then((g) => {
            return new Promise((resolve, reject) => {
                g.encode({
                    resolution: 4,
                }, (err, result) => {
                    if (err) reject(err)
                    else resolve(result)
                })
            })
        })
        .then(result => result)
        .catch((e) => {
            console.log(e)
            throw e
        })
}

/**
 * Returns a promise that renders a map tile for a given map coordinate
 * @param z
 * @param x
 * @param y
 * @returns {Promise<any>}
 */
export const image = (z, x, y) => {
    // create mapnik image
    const img = new mapnik.Image(TILE_WIDTH, TILE_HEIGHT)

    // render map to image
    // return asynchronous rendering method as a promise
    return createMap(z, x, y)
        .then((map) => {
            return new Promise((resolve, reject) => {
                map.render(img, {}, (err, result) => {
                    if (err) reject(err)
                    else resolve(result)
                })
            })
        })
        .then(encodeAsPNG)
        .catch((e) => {
            console.log(e)
            throw e
        })
}

const encodeAsPNG = (renderedTile) => new Promise((resolve, reject) => {
    renderedTile.encode('png', {}, (err, result) => {
        if (err) reject(err)
        else resolve(result)
    })
})

/**
 * Creates a map based on configured datasource and style information
 * @param z
 * @param x
 * @param y
 * @returns {Promise<mapnik.Map>}
 */
const createMap = (z, x, y) => {
    // Create a webmercator map with specified bounds
    const map = new mapnik.Map(TILE_WIDTH, TILE_HEIGHT, PROJECTION)
    map.bufferSize = 64
    map.extent = tileBounds(z, x, y)


    // load in mml and render to xml
    return readFile(path.join(__dirname, 'map-config.xml'), 'utf-8')
        .then((xml) => {
            return new Promise((resolve, reject) => {
                // Load map specification from xml string
                map.fromString(xml, (err, result) => {
                    if (err) reject(err)
                    else resolve(result)
                })
            })
        })
        .then(result => result)
        .catch((e) => {
            console.log(e)
            throw e
        })
}
