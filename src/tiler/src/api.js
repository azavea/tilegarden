/**
 * Entrypoint for APIGateway
 */

import APIBuilder from 'claudia-api-builder'

import { imageTile, utfGrid, vectorTile, createMap } from './tiler'
import HTTPError from './util/error-builder'

const IMAGE_HEADERS = {
    'Content-Type': 'image/png',
}

const UTF_HEADERS = {
    'Content-Type': 'application/json',
}

const VECTOR_HEADERS = {
    'Content-Encoding': 'gzip',
    'Content-Type': 'application/vnd.mapbox-vector-tile',
}

const HTML_RESPONSE = { success: { contentType: 'text/html' } }

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
    if (isNaN(x) || isNaN(y) || isNaN(z)) {
        throw HTTPError('Error: Coordinate values must be numbers!', 400)
    }
    return { z, x, y }
}

// Makes sure utf fields exist and returns them in the correct format
const processUTFQuery = (req) => {
    if (req.queryString.utf || req.queryString.fields || req.queryString.grid) {
        /* eslint-disable-next-line quotes */
        throw HTTPError("Invalid argument, did you mean '&utfFields='?", 400)
    }

    const queryString = req.queryString.utfFields
    if (!queryString) throw HTTPError('Error: UTF grid missing field query!', 400)

    return queryString.split(',')
}

// Returns a properly formatted list of layers
// or an empty list if there are none
const processLayers = (req) => {
    if (req.queryString.layers) return JSON.parse(req.queryString.layers)
    else if (req.queryString.layer || req.queryString.filter || req.queryString.filters) {
        /* eslint-disable-next-line quotes */
        throw HTTPError("Invalid argument, did you mean '&layers='?", 400)
    }

    return []
}

// Parses out the configuration specifications
const processConfig = req => ({
    s3bucket: req.queryString.s3bucket,
    config: req.queryString.config,
})

// Create new lambda API
const api = new APIBuilder()

// Handles error by returning an API response object
const handleError = (e) => {
    /* eslint-disable-next-line no-console */
    console.error(e)
    return new APIBuilder.ApiResponse(
        { message: e.message || e.toString() },
        { 'Content-Type': 'application/json' },
        e.http_code || 500,
    )
}

// Get tile for some zxy bounds
api.get(
    '/tile/{z}/{x}/{y}',
    (req) => {
        try {
            const { z, x, y } = processCoords(req)
            const layers = processLayers(req)
            const configOptions = processConfig(req)

            return imageTile(createMap(z, x, y, layers, configOptions))
                .then(img => new APIBuilder.ApiResponse(img, IMAGE_HEADERS, 200))
                .catch(handleError)
        } catch (e) {
            return handleError(e)
        }
    },
    { success: { contentHandling: 'CONVERT_TO_BINARY' } },
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
                .then(g => new APIBuilder.ApiResponse(g, UTF_HEADERS, 200))
                .catch(handleError)
        } catch (e) {
            return handleError(e)
        }
    },
)
// Catch this error because I keep doing it myself
api.get(
    '/utf/{z}/{x}/{y}',
    () => new APIBuilder.ApiResponse(
        /* eslint-disable-next-line quotes */
        { message: "Invalid path, did you mean '/grid/{z}/{x}/{y}'?" },
        { 'Content-Type': 'application/json' },
        404,
    ),
)

// Get a vector tile for some zxy bounds
api.get(
    '/vector/{z}/{x}/{y}',
    (req) => {
        try {
            const { z, x, y } = processCoords(req)
            const layers = processLayers(req)
            const configOptions = processConfig(req)

            return vectorTile(createMap(z, x, y, layers, configOptions), z, x, y)
                .then(vector => new APIBuilder.ApiResponse(vector, VECTOR_HEADERS, 200))
                .catch(handleError)
        } catch (e) {
            return handleError(e)
        }
    },
    { success: { contentHandling: 'CONVERT_TO_BINARY' } },
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

// 404 response
// This works in production but breaks the dev server just by existing
api.get(
    '/{wildcard+}',
    () => new APIBuilder.ApiResponse(
        { message: '404: Invalid path.' },
        { 'Content-Type': 'application/json' },
        404,
    ),
)

// not es6-ic, but necessary for claudia to find the index
module.exports = api
