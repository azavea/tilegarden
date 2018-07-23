/**
 * Entrypoint for APIGateway
 */

import APIBuilder from 'claudia-api-builder'

import { image, grid } from './tiler'
import messageTile from './util/message-tile'

const IMAGE_RESPONSE = {
    success: {
        contentType: 'image/png',
        contentHandling: 'CONVERT_TO_BINARY',
    },
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

// Create new lambda API
const api = new APIBuilder()

// Get tile for some zxy bounds
api.get(
    '/tile/{z}/{x}/{y}',
    (req) => {
        try {
            const { z, x, y } = processCoords(req)
            const layers = processLayers(req)

            return image(z, x, y, layers)
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

            return grid(z, x, y, utfFields, layers)
                .catch(e => JSON.stringify(e))
        } catch (e) {
            return JSON.stringify(e)
        }
    },
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
                    <li>Render tile at zoom/x/y: <code>/tile/{z}/{x}/{y}.png</code></li>
                    <li>UTF grid at zoom/x/y: <code>/grid/{z}/{x}/{y}?utfFields=field1,field2,field...N</code></li>
                    <li>Filter layers: add <code>?layers=layer1,layer2,layer...N</code></li>
                </ul>
                <a href="https://github.com/azavea/tilegarden">See on GitHub</a>
            </body>
        </html>
    `,
    /* eslint-enable max-len */
    HTML_RESPONSE,
)

// not es6-ic, but necessary for claudia to find the index
module.exports = api
