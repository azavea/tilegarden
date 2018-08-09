/**
 * Module that handles tile creation and other
 * map drawing functionality
 */

/* eslint-disable no-console */

import mapnik from 'mapnik'
import path from 'path'

import { readFile } from './util/fs-promise'
import filterVisibleLayers from './util/layer-filter'
import bbox from './util/bounding-box'
import HTTPError from './util/error-builder'

const TILE_HEIGHT = 256
const TILE_WIDTH = 256

// Register plugins
mapnik.register_default_input_plugins()

// If there's a problem with the database, the details of that shouldn't be exposed to the user.
const postgisFilter = (e) => {
    console.error(e)
    if (e.toString().indexOf('Postgis Plugin') > -1) {
        throw HTTPError('Postgis Error', 500)
    }
    throw e
}

/**
 * Creates a map based on configured datasource and style information
 * @param z
 * @param x
 * @param y
 * @returns {Promise<mapnik.Map>}
 */
const createMap = (z, x, y, layers, config = 'map-config') => {
    // Create a webmercator map with specified bounds
    const map = new mapnik.Map(TILE_WIDTH, TILE_HEIGHT)
    map.bufferSize = 64

    const configName = path.join(__dirname, `config/${config}.xml`)

    // Load map specification from xml string
    return readFile(configName, 'utf-8')
        .then(xml => filterVisibleLayers(xml, layers))
        .then(xml => new Promise((resolve, reject) => {
            map.fromString(xml, (err, result) => {
                if (err) {
                    reject(err)
                } else {
                    /* eslint-disable-next-line no-param-reassign */
                    result.extent = bbox(z, x, y, TILE_HEIGHT, result.srs)

                    resolve(result)
                }
            })
        }))
        .catch(postgisFilter)
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
export const image = (z, x, y, layers, config) => {
    // create mapnik image
    const img = new mapnik.Image(TILE_WIDTH, TILE_HEIGHT)

    // render map to image
    // return asynchronous rendering method as a promise
    return createMap(z, x, y, layers, config)
        .then(map => new Promise((resolve, reject) => {
            map.render(img, {}, (err, result) => {
                if (err) reject(err)
                else resolve(result)
            })
        }))
        .then(encodeAsPNG)
        .catch(postgisFilter)
}

/**
 * Return a promise that renders a utf grid for a given map coordinate
 * @param z
 * @param x
 * @param y
 * @returns {Promise<any>}
 */
export const grid = (z, x, y, utfFields, layers, config) => {
    const grd = new mapnik.Grid(TILE_WIDTH, TILE_HEIGHT)

    return createMap(z, x, y, layers, config)
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
        .catch(postgisFilter)
}

/**
 * Return a promise that resolves to a vector tile of the input
 * coordinates, compressed as a gzip
 * @param z
 * @param x
 * @param y
 * @param layers
 * @returns {Promise<mapnik.Buffer>}
 */
export const vectorTile = (z, x, y, layers, config) => {
    const vt = new mapnik.VectorTile(z, x, y)

    return createMap(z, x, y, layers, config)
        .then(map => new Promise((resolve, reject) => {
            map.render(vt, (err, tile) => {
                if (err) reject(err)
                else resolve(tile)
            })
        }))
        .then(tile => new Promise((resolve, reject) => {
            const compressionOptions = {
                compression: 'gzip',
                level: 9,
                strategy: 'FILTERED',
            }
            tile.getData(compressionOptions, (err, data) => {
                if (err) reject(err)
                else resolve(data)
            })
        }))
        .catch(postgisFilter)
}
