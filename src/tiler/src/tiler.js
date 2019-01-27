/**
 * Module that handles tile creation and other
 * map drawing functionality
 */

const mapnik = require('mapnik')
const path = require('path')
const aws = require('aws-sdk')

const { promisify } = require('util')
const readFile = promisify(require('fs').readFile)

const filterVisibleLayers = require('./util/layer-filter')
const bbox = require('./util/bounding-box')
const HTTPError = require('./util/error-builder')

const TILE_HEIGHT = 256
const TILE_WIDTH = 256

const DEFAULT_CONFIG_FILENAME = 'map-config.xml'

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
 * Based off the config options object, search for a config.xml
 * file and return it as a Promise that evaluates to an XML string.
 * @param options
 * @returns {Promise<any>}
 */
const fetchMapFile = (options) => {
    const { s3bucket, config = DEFAULT_CONFIG_FILENAME } = options

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
    return readFile(configName, 'utf-8').catch((err) => {
        if (err.code === 'ENOENT' && config === DEFAULT_CONFIG_FILENAME) {
            /* eslint-disable-next-line no-param-reassign */
            err.message = 'Error: No default configuration. Must provide a config= parameter.'
        }
        throw err
    })
}

/**
 * Creates a map based on configured datasource and style information
 * @param z
 * @param x
 * @param y
 * @returns {Promise<mapnik.Map>}
 */
const createMap = (mapConfig) => {
    const { z, x, y, layers, configOptions } = mapConfig
    // Create a webmercator map with specified bounds
    const map = new mapnik.Map(TILE_WIDTH, TILE_HEIGHT)
    map.bufferSize = 64

    // Load map specification from xml string
    return fetchMapFile(configOptions)
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

/**
 * Returns a promise that renders a map tile for a given map coordinate
 * @param z
 * @param x
 * @param y
 * @returns {Promise<any>}
 */
module.exports.imageTile = (mapConfig) => {
    // create mapnik image
    const img = new mapnik.Image(TILE_WIDTH, TILE_HEIGHT)

    // render map to image
    // return asynchronous rendering method as a promise
    const map = createMap(mapConfig)
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
        .catch(postgisFilter)
}

/**
 * Return a promise that renders a utf grid for a given map coordinate
 * @param z
 * @param x
 * @param y
 * @returns {Promise<any>}
 */
module.exports.utfGrid = (mapConfig, utfFields) => {
    const grid = new mapnik.Grid(TILE_WIDTH, TILE_HEIGHT)

    const map = createMap(mapConfig)
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
module.exports.vectorTile = (mapConfig, z, x, y) => {
    const vt = new mapnik.VectorTile(z, x, y)

    const map = createMap(mapConfig)
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
        .catch(postgisFilter)
}
