/**
 * Module that handles tile creation and other
 * map drawing functionality
 */

/* eslint-disable no-console */

import mapnik from 'mapnik'
import SphericalMercator from '@mapbox/sphericalmercator'
import path from 'path'

import { readFile } from './util/fs-promise'

const TILE_HEIGHT = 256
const TILE_WIDTH = 256

// Register plugins
mapnik.register_default_input_plugins()

/**
 * Disables all layers that aren't specified in the query string
 */
const filterLayers = (xmlString, layers) => {
    // Only filter if there ARE layers to filter on
    if (layers && layers.length > 0) {
        return xmlString.replace(
            /(<Layer name="(.+)")>/g,
            (fullMatch, beginning, layerName) => {
                if (!layers.includes(layerName)) {
                    return `${beginning} status="0">`
                }
                return fullMatch
            },
        )
    }

    return xmlString
}

/**
 * Creates a map based on configured datasource and style information
 * @param z
 * @param x
 * @param y
 * @returns {Promise<mapnik.Map>}
 */
const createMap = (z, x, y, layers) => {
    // Create a webmercator map with specified bounds
    const map = new mapnik.Map(TILE_WIDTH, TILE_HEIGHT)
    map.bufferSize = 64
    map.extent = new SphericalMercator().bbox(x, y, z, false, process.env.EPSG)

    // Load map specification from xml string
    return readFile(path.join(__dirname, 'map-config.xml'), 'utf-8')
        .then(xml => filterLayers(xml, layers))
        .then(xml => new Promise((resolve, reject) => {
            map.fromString(xml, (err, result) => {
                if (err) reject(err)
                else {
                    /* eslint-disable-next-line no-param-reassign */
                    result.extent = new SphericalMercator().bbox(x, y, z)
                    resolve(result)
                }
            })
        }))
        .catch((e) => {
            console.log(e)
            throw e
        })
}

const encodeAsPNG = renderedTile => new Promise((resolve, reject) => {
    renderedTile.encode('png', {}, (err, result) => {
        if (err) reject(err)
        else resolve(result)
    })
})


/**
 * Returns a promise that renders a map tile for a given map coordinate
 * @param z
 * @param x
 * @param y
 * @returns {Promise<any>}
 */
export const image = (z, x, y, layers) => {
    // create mapnik image
    const img = new mapnik.Image(TILE_WIDTH, TILE_HEIGHT)

    // render map to image
    // return asynchronous rendering method as a promise
    return createMap(z, x, y, layers)
        .then(map => new Promise((resolve, reject) => {
            map.render(img, {}, (err, result) => {
                if (err) reject(err)
                else resolve(result)
            })
        }))
        .then(encodeAsPNG)
        .catch((e) => {
            console.log(e)
            throw e
        })
}

/**
 * Return a promise that renders a utf grid for a given map coordinate
 * @param z
 * @param x
 * @param y
 * @returns {Promise<any>}
 */
export const grid = (z, x, y, utfFields, layers) => {
    const grd = new mapnik.Grid(TILE_WIDTH, TILE_HEIGHT)

    return createMap(z, x, y, layers)
        .then(map => new Promise((resolve, reject) => {
            map.render(grd, {
                layer: 0,
                fields: utfFields,
            }, (err, rendered) => {
                if (err) reject(err)
                else resolve(rendered)
            })
        }))
        .then(g => new Promise((resolve, reject) => {
            g.encode({
                resolution: 4,
            }, (err, result) => {
                if (err) reject(err)
                else resolve(result)
            })
        }))
        .catch((e) => {
            console.log(e)
            throw e
        })
}
