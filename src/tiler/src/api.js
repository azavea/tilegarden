/**
 * Entrypoint for APIGateway
 */

import APIBuilder from 'claudia-api-builder'

import { imageTile, utfGrid, vectorTile, createMap } from './tiler'
import messageTile from './util/message-tile'

const IMAGE_RESPONSE = {
    success: {
        contentType: 'image/png',
        contentHandling: 'CONVERT_TO_BINARY',
    },
}

const HTML_RESPONSE = { success: { contentType: 'text/html' } }

const VECTOR_RESPONSE = {
    success: {
        headers: {
            'Content-Encoding': 'gzip',
        },
        contentType: 'application/vnd.mapbox-vector-tile',
        contentHandling: 'CONVERT_TO_BINARY',
    },
}

// Converts a req object to a set of coordinates
const processCoords = (req) => {
    // Handle url params
    const z = Number(req.pathParams.z)
    const x = Number(req.pathParams.x)

    // strip .png off of y if necessary
    const preY = req.pathParams.y
    const y = Number(preY.substr(0, preY.lastIndexOf('.')) || preY)

    // Check type of coords
    /* eslint-disable-next-line no-restricted-globals */
    if (isNaN(x) || isNaN(y) || isNaN(z)) throw new Error('Coordinate values must be numbers!')
    return { z, x, y }
}

// Makes sure utf fields exist and returns them in the correct format
const processUTFQuery = (req) => {
    const queryString = req.queryString.utfFields
    if (!queryString) throw new Error('UTF grid missing field query!')
    return queryString.split(',')
}

// Returns a properly formatted list of layers
// or an empty list if there are none
const processLayers = (req) => {
    if (req.queryString.layers) return req.queryString.layers.split(',')
    return []
}

// Parses out the configuration specifications
const processConfig = req => ({
    s3bucket: req.queryString.s3bucket,
    config: req.queryString.config,
})

// Create new lambda API
const api = new APIBuilder()

// Get tile for some zxy bounds
api.get(
    '/tile/{z}/{x}/{y}',
    (req) => {
        try {
            const { z, x, y } = processCoords(req)
            const layers = processLayers(req)
            const configOptions = processConfig(req)

            return imageTile(createMap(z, x, y, layers, configOptions))
                .catch(e => messageTile(e.toString()))
        } catch (e) {
            return messageTile(e.toString())
        }
    },
    IMAGE_RESPONSE,
)

// Get utf grid for some zxy bounds
// in the original implementation this alone uses cors: why?
api.get(
    '/grid/{z}/{x}/{y}',
    (req) => {
        try {
            const { z, x, y } = processCoords(req)
            const utfFields = processUTFQuery(req)
            const layers = processLayers(req)
            const configOptions = processConfig(req)

            return utfGrid(createMap(z, x, y, layers, configOptions), utfFields)
                .catch(e => JSON.stringify(e))
        } catch (e) {
            return JSON.stringify(e)
        }
    },
)

// Get a vector tile for some zxy bounds
api.get(
    '/vector/{z}/{x}/{y}',
    (req) => {
        const { z, x, y } = processCoords(req)
        const layers = processLayers(req)
        const configOptions = processConfig(req)

        return vectorTile(createMap(z, x, y, layers, configOptions), z, x, y)
    },
    VECTOR_RESPONSE,
)

api.get(
    '/',
    /* eslint-disable max-len */
    () => `
        <html>
            <head>
            <title>Tilegarden</title>
            </head>
            <body>
                <h2>Tilegarden Usage:</h2>
                <ul>
                    <li>Render raster tile at zoom/x/y: <code>/tile/{z}/{x}/{y}.png</code></li>
                    <li>Render vector tile, rather than raster: <code>/vector/{z}/{x}/{y}</code></li>
                    <li>UTF grid at zoom/x/y: <code>/grid/{z}/{x}/{y}?utfFields=field1,field2,field...N</code></li>
                    <li>Filter layers: add <code>?layers=layer1,layer2,layer...N</code></li>
                </ul>
                <a href="https://azavea.github.io/tilegarden">Check out a demo &rArr;</a>
                </br>
                <a href="https://github.com/azavea/tilegarden">See on GitHub &rArr;</a>
            </body>
        </html>
    `,
    /* eslint-enable max-len */
    HTML_RESPONSE,
)

// not es6-ic, but necessary for claudia to find the index
module.exports = api
