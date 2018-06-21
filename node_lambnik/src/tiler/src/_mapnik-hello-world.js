/**
 * Hello world for tiling based off the examples here:
 * https://github.com/mapnik/node-mapnik-sample-code/blob/master/tile/database/app.js
 */
import mapnik from 'mapnik'
import SphericalMercator from '@mapbox/sphericalmercator'
import path from 'path'
import fs from 'fs'
import mercator from './_mercator'

const POSTGIS_SETTINGS = {
    host: process.env.POSTGRES_HOST,
    port: '5432',
    dbname: process.env.POSTGRES_DB,
    table: 'pa_gardens',
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    type : 'postgis',
    geometry_field: 'the_geom_webmercator',
}

const getDatasource = () => {
    // register postgis plugin
    if (mapnik.register_default_input_plugins) {
        mapnik.register_default_input_plugins()
    }

    // TODO: what happens if register_default_input_plugins is undefined?
    return new mapnik.Datasource(POSTGIS_SETTINGS)
}

export const serveTile = (z, x, y, inlet) => {
    // console.log('Attempting to serve tile.')
    const proj4 = '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs +over' // noqa
    const map = new mapnik.Map(256, 256, proj4)
    // console.log(`Initial map: ${JSON.stringify(map)}`)
    const layer = new mapnik.Layer('tile', proj4)
    // console.log(`Initial layer: ${JSON.stringify(map)}`)
    const postgis = getDatasource()
    // console.log('# Datasource info:')
    // console.log(`### Description: ${JSON.stringify(postgis.describe())}`)
    // console.log(`### Fields: ${JSON.stringify(postgis.fields())}`)
    // console.log(`### Extent: ${JSON.stringify(postgis.extent())}`)
    // console.log(`### Featureset: ${JSON.stringify(postgis.featureset())}`)
    const bbox = mercator.xyz_to_envelope(x, y, z, false)// new SphericalMercator().bbox(x, y, z, false)
    // console.log(`Initial bounding box: ${JSON.stringify(bbox)}`)
    // console.log('Created constants.')


    layer.datasource = postgis
    layer.styles = ['point']

    map.bufferSize = 64
    map.load(path.join(__dirname, 'point-vector.xml'), { strict: true }, (err, _map) => {
        if (err) throw err
        // console.log('Loaded stylesheet.')

        _map.add_layer(layer)

        // console.log(_map.toXML())

        _map.extent = bbox
        const img = new mapnik.Image(_map.width, _map.height)
        _map.render(img, {}, (err, _img) => {
            if (err) throw err
            // console.log('Rendered image.')

            const buffer = _img.encodeSync('png')
            // test whether itll just like..... write it to file
            const dir = path.join(__dirname, '../tiles/')
            if ( !fs.existsSync(dir)) fs.mkdirSync(dir)
            fs.writeFileSync(`${dir}tile${z}${x}${y}.png`, buffer)
            //console.log(`Encoded image: ${buffer.toString()}`)
            return buffer.toString()
        })
    })
}
