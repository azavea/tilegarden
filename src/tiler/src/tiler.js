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

/* Utility function to correctly promisify object methods
 *
 * Many methods use 'this' in a way that makes them break when you try to use util.promisify
 * on them. There's a workaround, though (see https://github.com/ljharb/util.promisify/issues/12)
 * This is a convenience function that implements it.
 * The resulting syntax, `promisifyMethod(object, 'method')` is a bit weird, but still seems better
 * than having to do object.method.bind(object) everywhere.
 */
function promisifyMethod(object, method) {
    return promisify(object[method].bind(object))
}

// If there's a problem with the database, the details of that shouldn't be exposed to the user.
const postgisFilter = (e) => {
    console.error(e)
    if (e.toString().indexOf('Postgis Plugin') > -1) {
        return HTTPError('Postgis Error', 500)
    }
    return e
}

/**
 * Based off the config options object, search for a config.xml
 * file and return it as a Promise that evaluates to an XML string.
 * @param options
 * @returns {Promise<string>}
 */
function fetchMapFile(options) {
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
 */
async function createMap(mapConfig) {
    const { z, x, y, layers, configOptions } = mapConfig
    // Create a webmercator map with specified bounds
    const map = new mapnik.Map(TILE_WIDTH, TILE_HEIGHT)
    map.bufferSize = 64

    // Load map specificationu from xml string
    try {
        const mapConfigXml = await fetchMapFile(configOptions)
        const filteredMapConfigXml = await filterVisibleLayers(mapConfigXml, layers)
        const configuredMap = await promisifyMethod(map, 'fromString')(filteredMapConfigXml)
        configuredMap.extent = bbox(z, x, y, TILE_HEIGHT, configuredMap.srs)
        return configuredMap
    } catch (err) {
        throw postgisFilter(err)
    }
}

/**
 * Renders a map tile for a given map coordinate
 */
module.exports.imageTile = async (mapConfig) => {
    // create mapnik image
    const img = new mapnik.Image(TILE_WIDTH, TILE_HEIGHT)

    // render map to image
    try {
        const map = await createMap(mapConfig)
        const tile = await promisifyMethod(map, 'render')(img, {})
        const encoded = await promisifyMethod(tile, 'encode')('png', {})
        return encoded
    } catch (err) {
        throw postgisFilter(err)
    }
}

/**
 * Renders a utf grid for a given map coordinate
 */
module.exports.utfGrid = async (mapConfig, utfFields) => {
    const grid = new mapnik.Grid(TILE_WIDTH, TILE_HEIGHT)
    const map = await createMap(mapConfig)
    try {
        const tile = await promisifyMethod(map, 'render')(grid, { layer: 0, fields: utfFields })
        const encoded = await promisifyMethod(tile, 'encode')({ resolution: 4 })
        return encoded
    } catch (err) {
        throw postgisFilter(err)
    }
}

/**
 * Renders a vector tile of the input coordinates, compressed as a gzip
 */
module.exports.vectorTile = async (mapConfig, z, x, y) => {
    const vt = new mapnik.VectorTile(z, x, y)

    const map = await createMap(mapConfig)
    try {
        const tile = await promisifyMethod(map, 'render')(vt)
        const compressionOptions = {
            compression: 'gzip',
            level: 9,
            strategy: 'FILTERED',
        }
        const compressed = await promisifyMethod(tile, 'getData')(compressionOptions)
        return compressed
    } catch (err) {
        throw postgisFilter(err)
    }
}
