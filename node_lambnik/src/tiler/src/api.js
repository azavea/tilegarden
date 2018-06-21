/**
 * Entrypoint for APIGateway
 */

import APIBuilder from 'claudia-api-builder'

import { home, getGrid, getImage } from './tile-interface'

const IMAGE_RESPONSE = {
    success: {
        contentType: 'image/png',
        contentHandling: 'CONVERT_TO_BINARY',
    },
}

// Create new lambda API
const api = new APIBuilder()

// Add pngs to binary media types
api.setBinaryMediaTypes(['image/png'])

api.get('/', () => home())

// Get utf grid for some zxy bounds
// TODO: in the original implementation this alone uses cors: why?
api.get(
    '/grid/{z}/{x}/{y}',
    req => getGrid(req),
)

// Get tile for some zxy bounds
api.get(
    '/tile/{z}/{x}/{y}',
    req => getImage(req),
    IMAGE_RESPONSE,
)

// Handles favicon
// TODO: make one?
api.get('/favicon.ico', () => {
    // pass
})

// not es6-ic, but necessary for claudia to find the index
module.exports = api
