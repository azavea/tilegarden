/**
 * Entrypoint for APIGateway
 */

import APIBuilder from 'claudia-api-builder'

import { home, img, getGrid, getImage } from './tile-interface'
import * as Endpoints from './util/path-config'

const IMAGE_RESPONSE = {
    success: {
        contentType: 'image/png',
        contentHandling: 'CONVERT_TO_BINARY',
    },
}

const HTML_RESPONSE = { success: { contentType: 'text/html' } }

// Create new lambda API
const api = new APIBuilder()

api.get(Endpoints.USAGE_PATH, () => home(), HTML_RESPONSE)

// Get utf grid for some zxy bounds
// in the original implementation this alone uses cors: why?
api.get(
    Endpoints.GRID_PATH,
    req => getGrid(req),
)

// Get tile for some zxy bounds
api.get(
    Endpoints.TILE_PATH,
    req => getImage(req),
    IMAGE_RESPONSE,
)

// Handles favicon
api.get(Endpoints.FAVICON_PATH, () => {
    // pass
})

// not es6-ic, but necessary for claudia to find the index
module.exports = api
