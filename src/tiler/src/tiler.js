/**
 * @module tiler
 * @description Module that handles tile creation and other map drawing functionality.
 */

/* eslint-disable no-console */

import mapnik from 'mapnik'
import path from 'path'
import aws from 'aws-sdk'

import { readFile } from './util/fs-promise'
import filterVisibleLayers from './util/layer-filter'
import bbox from './util/bounding-box'

const TILE_HEIGHT = 256
const TILE_WIDTH = 256

// Register plugins
mapnik.register_default_input_plugins()

/**
 *@description Use config options to read in a configuration file at the specified location.
 * @function fetchMapFile
 * @private
 * @param {Object} options - Map configuration object.
 * @param {string} [options.config=map-config.xml] - File name or S3 Key of map configuration file.
 * @param {string} [options.s3bucket] - Name of the S3 bucket where the configuration file is stored.
 * @returns {Promise<Buffer>} Promise object that resolves to a Buffer containing a configuration file.
 */
const fetchMapFile = (options) => {
    const { s3bucket, config = 'map-config.xml' } = options

    // If an s3 bucket is specified, treat config as an object key and attempt to fetch
    if (s3bucket) {
        return new Promise((resolve, reject) => {
            new aws.S3().getObject({
                Bucket: s3bucket,
                Key: config,
            }, (err, data) => {
                if (err) reject(err)
                else resolve(data.Body.toString())
            })
        })
    }

    // otherwise, load from the local directory, making sure to add .xml to the file name
    const configName = path.join(
        __dirname,
        `config/${config}${path.extname(config) !== '.xml' ? '.xml' : ''}`,
    )
    return readFile(configName, 'utf-8')
}

/**
 * @description Create a new mapnik Map object of a given map coordinate.
 * @function createMap
 * @public
 * @param {number} z - Map zoom level.
 * @param {number} x - Map x-coordinate.
 * @param {number} y - Map y-coordinate.
 * @param {Array.<string>} layers - List of names of layers to display.
 * @param {Object} configOptions - Map configuration object.
 *  * @param {string} [configOptions.config=map-config.xml] - File name or S3 Key of map configuration file.
 * @param {string} [configOptions.s3bucket] - Name of the S3 bucket where the configuration file is stored.
 * @returns {Promise<mapnik.Map>} Promise object that resolves to a mapnik Map
 */
export const createMap = (z, x, y, layers, configOptions) => {
    // Create a webmercator map with specified bounds
    const map = new mapnik.Map(TILE_WIDTH, TILE_HEIGHT)
    map.bufferSize = 64

    // Load map specification from xml string
    return fetchMapFile(configOptions)
        .then(xml => filterVisibleLayers(xml, layers))
        .then(xml => new Promise((resolve, reject) => {
            map.fromString(xml, (err, result) => {
                if (err) reject(err)
                else {
                    /* eslint-disable-next-line no-param-reassign */
                    result.extent = bbox(z, x, y, TILE_HEIGHT, result.srs)

                    resolve(result)
                }
            })
        }))
        .catch((e) => {
            console.log(e)
            throw e
        })
}

/**
 * @description Render a mapnik Map to an image file
 * @function image
 * @public
 * @param {Promise<mapnik.Map>} map - mapnik Map to render.
 * @returns {Promise<Buffer>} Promise object that resolves to a buffer containing a PNG-encoded image file.
 */
export const imageTile = (map) => {
    // create mapnik image
    const img = new mapnik.Image(TILE_WIDTH, TILE_HEIGHT)

    // render map to image
    // return asynchronous rendering method as a promise
    return map
        .then(m => new Promise((resolve, reject) => {
            m.render(img, {}, (err, result) => {
                if (err) reject(err)
                else resolve(result)
            })
        }))
        .then(renderedTile => new Promise((resolve, reject) => {
            renderedTile.encode('png', {}, (err, result) => {
                if (err) reject(err)
                else resolve(result)
            })
        }))
        .catch((e) => {
            console.log(e)
            throw e
        })
}

/**
 * @description Render a mapnik Map to a UTF grid
 * @function grid
 * @public
 * @param {Promise<mapnik.Map>} map - mapnik Map to render.
 * @param {string[]} utfFields - List of database fields to expose in the UTF grid.
 * @returns {Promise<string>} Promise object that resolves to a UTF grid, as a JSON string.
 */
export const utfGrid = (map, utfFields) => {
    const grid = new mapnik.Grid(TILE_WIDTH, TILE_HEIGHT)

    return map
        .then(m => new Promise((resolve, reject) => {
            m.render(grid, {
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

/**
 * @description Render a mapnik Map to a vector tile file
 * @function vectorTile
 * @public
 * @param {Promise<mapnik.Map>} map - mapnik Map to render.
 * @param {number} z - Map z-coordinate.
 * @param {number} x - Map x-coordinate.
 * @param {number} y - Map y-coordinate.
 * @returns {Promise<Buffer>} Promise object that resolves to a gzipped Mapnik vector tile.
 */
export const vectorTile = (map, z, x, y) => {
    const vt = new mapnik.VectorTile(z, x, y)

    return map
        .then(m => new Promise((resolve, reject) => {
            m.render(vt, (err, tile) => {
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
        .catch((e) => {
            console.log(e)
            throw e
        })
}
