/**
 * Hello world for tiling based off the examples here:
 * https://github.com/mapnik/node-mapnik-sample-code/blob/master/tile/database/app.js
 */
import mapnik from 'mapnik'
import mercator from '@mapbox/sphericalmercator'
import path from 'path'

const POSTGIS_SETTINGS = {
    host: process.env.POSTGRES_HOST,
    port: '5432',
    dbname: process.env.POSTGRES_DB,
    table: 'pwd_inlets',
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    type : 'raster',
    geometry_field: 'geom',
    initial_size: '10', // TODO: what does this do?
    estimate_extent: '1', // TODO: what does THIS do?
}

const getDatasource = () => {
    // register postgis plugin
    if (mapnik.register_default_input_plugins) {
        mapnik.register_default_input_plugins()
        console.log('Registered default input plugins.')
    }

    // TODO: what happens if register_default_input_plugins is undefined?
    return new mapnik.Datasource(POSTGIS_SETTINGS)
}

export const serveTile = (z, y, x) => {
    const epsg3857 = '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs' // noqa
    const map = new mapnik.Map(256, 256, epsg3857)
    const layer = new mapnik.Layer('tile', epsg3857)
    const postgis = new mapnik.Datasource(getDatasource())
    const bbox = mercator.xyz_to_envelope(x, y, z, false)

    layer.datasource = postgis
    layer.styles = ['point']

    map.bufferSize = 64
    map.load(path.join(__dirname, 'point-vector.xml'), { strict: true }, (err, _map) => {
        if (err) throw err

        _map.add_layer(layer)

        _map.extent = bbox
        const img = new mapnik.Image(map.width, map.height)
        _map.render(img, (err, _img) => {
            if (err) throw err

            return _img.encodeSync('png')
        })
    })
}
