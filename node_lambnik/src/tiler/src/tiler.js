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

// Register plugins
mapnik.register_default_input_plugins()

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
    const map = new mapnik.Map(TILE_WIDTH, TILE_HEIGHT)
    map.bufferSize = 64
    map.extent = new SphericalMercator().bbox(x, y, z, false, process.env.EPSG)

    // Load map specification from xml string
    return readFile(path.join(__dirname, 'map-config.xml'), 'utf-8')
        .then((xml) => {
            return new Promise((resolve, reject) => {
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
