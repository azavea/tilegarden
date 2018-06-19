/**
 * Module that handles tile creation and other
 * map drawing functionality
 */

import mapnik from 'mapnik'
import SphericalMercator from '@mapbox/sphericalmercator'
import Buffer from 'buffer'

const TYPES = {
    a: 'INLCTY4',
    b: 'INLCTYC3',
    c: 'INLOMG4',
    d: 'INLOMG6',
}

const TILE_HEIGHT = 256
const TILE_WIDTH = 256

/**
 * Defines PostGIS connection information
 * @type {mapnik.Datasource}
 */
const POSTGIS_SETTINGS = {
    host: process.env.POSTGRES_HOST,
    port: '5432',
    dbname: process.env.POSTGRES_DB,
    table: 'pwd_inlets',
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    type: 'postgis',
    geometry_field: 'geom',
    initial_size: '10', // TODO: what does this do?
    estimate_extent: '1', // TODO: what does THIS do?
}
const getDatasource = () => {
    // register postgis plugin
    if (mapnik.register_default_input_plugins) {
        mapnik.register_default_input_plugins()
    }

    // TODO: what happens if register_default_input_plugins is undefined?
    return new mapnik.Datasource(POSTGIS_SETTINGS)
}

/**
 * TODO: is this doing the right thing?
 * TODO: what is this meant to do?
 * @param z
 * @param x
 * @param y
 * @returns {*}
 */
const tileBounds = (z, x, y) => new SphericalMercator().bbox(x, y, z)

/**
 * TODO: is this doing the right thing?
 * TODO: what is this meant to do?
 * @param z
 * @param x
 * @param y
 * @param inletType
 * @returns {Uint8Array}
 */
export const grid = (z, x, y, inletType) => {
    const grd = new mapnik.Grid(TILE_WIDTH, TILE_HEIGHT)
    const map = create_map(z, x, y, inletType)

    mapnik.render(map, grd, {
        layer: 0,
        fields: ['inlettype'],
    })
    const utfgrid = grd.encode('utf', {
        resolution: 4,
    })

    return utfgrid
}

/**
 * TODO: is this doing the right thing?
 * TODO: what is this meant to do?
 * @param z
 * @param x
 * @param y
 * @param inletType
 * @returns {*}
 */
export const image = (z, x, y, inletType) => {
    const img = new mapnik.Image(TILE_WIDTH, TILE_HEIGHT)

    const map = createMap(z, x, y, inletType)
    mapnik.render(map, img)
    const png = img.toString('png') // TODO: what?

    // TODO: this should return what is in Python a bytes object
    // TODO: THE REASON FOR THIS is that chalice can only return
    // TODO: strings of bytes, not image files, is that what was
    // TODO: wrong?
    return Buffer.from(png)
}

/**
 * TODO: is this doing the right thing?
 * TODO: what is this meant to do?
 * @param z
 * @param x
 * @param y
 * @param inletType
 * @returns {mapnik.Map}
 */
const createMap = (z, x, y, inletType) => {
    // Get latlng bounds for zxy tile
    const bounds = tileBounds(z, x, y)

    // Create a webmercator map
    const epsg3857 = '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs' // noqa
    const projection = new mapnik.Projection(epsg3857)
    const map = new mapnik.Map(TILE_WIDTH, TILE_HEIGHT, epsg3857)
    // map.src = epsg3857

    // Specify symbology for the tile features
    // TODO: this apparently works ENTIRELY differently in node
    // const style = new mapnik.Style()
    // const rule = new mapnik.Rule()
    // const ptsym = new mapnik.PointSymbolizer()
    // rule.symbols.append(ptsym)
    // style.rules.append(rule)
    // // TODO: this should probably have a better name than MyStyle
    // map.appendStyle('My Style', style)

    // TODO: this is currently doing nothing
    // Apply dynamic filtering
    const inlet = TYPES[inletType]
    let tblQuery
    if (inlet) {
        tblQuery = "(select geom, inlettype from pwd_inlets where inlettype = '{}') as q".format(inlet)
    } else {
        tblQuery = 'pwd_inlets'
    }

    // Create PostGIS layer
    // TODO: how do I get the postgis plugin
    // const postgisDs = new PostGIS(
    //     process.env.POSTGRES_HOST,
    //     process.env.POSTGRES_USER,
    //     process.env.POSTGRES_PASSWORD,
    //     process.env.POSTGRES_DB,
    //     tblQuery,
    // )
    const layer = new mapnik.Layer('PostGIS')
    layer.datasource = getDatasource()
    // layer.styles.append('My Style')
    map.add_layer(layer)

    // Clip map to the tile bounds
    const wg84Bbox = mapnik.Box2d(
        bounds.east,
        bounds.south,
        bounds.west,
        bounds.north,
    )
    const wmBbox = projection.forward(wg84Bbox)
    map.zoomtoBox(wmBbox)
    map.bufferSize = 256 // TODO: un-magic number this

    return map
}
