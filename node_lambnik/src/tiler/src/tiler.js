/**
 * Module that handles tile creation and other
 * map drawing functionality
 */

import mapnik from 'mapnik'
import SphericalMercator from '@mapbox/sphericalmercator'
import path from 'path'

const TILE_HEIGHT = 256
const TILE_WIDTH = 256

const PROJECTION = '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs +over'

/**
 * Defines PostGIS connection information
 * @type {{host: *, port: string, dbname: *, table: string, user: *, password: *, type: string, geometry_field: string}}
 */
const POSTGIS_SETTINGS = {
    host: process.env.POSTGRES_HOST,
    port: '5432',
    dbname: process.env.POSTGRES_DB,
    table: process.env.DB_TABLE,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    type : 'postgis',
    geometry_field: process.env.GEOMETRY_FIELD,
}

/**
 * Verifies that datasource plugins are registered
 * and returns a Datasource object if so
 * @returns {mapnik.Datasource}
 */
const getDatasource = () => {
    // register postgis plugin
    if (mapnik.register_default_input_plugins) {
        mapnik.register_default_input_plugins()
    }

    // TODO: what happens if register_default_input_plugins is undefined?
    return new mapnik.Datasource(POSTGIS_SETTINGS)
}

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
export const grid = (z, x, y) => {
    const grd = new mapnik.Grid(TILE_WIDTH, TILE_HEIGHT)

    return createMap(z, x, y)
        .then((map) => new Promise((resolve, reject) => {
            map.render(grd, {
                layer: 0,
                fields: ['inlettype'],
            }, (err, _grd) => {
                if (err) fail(err)

                return _grd.encode('utf', {
                    resolution: 4,
                })
            })
        }))
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
 * @returns {mapnik.Map}
 */
const createMap = (z, x, y) => {
    // Get latlng bounds for zxy tile
    const bounds = tileBounds(z, x, y)

    // Create a webmercator map
    const map = new mapnik.Map(TILE_WIDTH, TILE_HEIGHT, PROJECTION)
    map.bufferSize = 64
    map.extent = bounds
    const layer = new mapnik.Layer('tile', PROJECTION)
    layer.styles = ['point']

    // Attach datasource to layer
    const postgis = getDatasource()
    layer.datasource = postgis
    map.add_layer(layer)

    // Asynchronously load tiles from XML and return
    return new Promise((resolve, reject) => {
        map.load(path.join(__dirname, 'res/point-vector.xml'), { strict: true }, (err, result) => {
            if (err) reject(err)
            else resolve(result)
        })
    })
}
