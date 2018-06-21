/**
 * Entrypoint for APIGateway
 */

import APIBuilder from 'claudia-api-builder'

import { home, getGrid, getTile } from './tile-interface'
import { serveTile } from './_mapnik-hello-world'
import {grid} from "./tiler"

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


/**
 * TEST ONLY
 */
api.get(
    '/test/{z}/{x}/{y}.png',
    (req) => {
        // console.log('Handling request')
        try {
            // Handle url params
            const inlet = req.queryString.inlet
            const z = Number(req.pathParams.z)
            const x = Number(req.pathParams.x)
            const y = Number(req.pathParams.y)

            // console.log('calling serve tile')
            // create grid
            return serveTile(z, x, y, inlet)
        } catch (e) {
            // console.log(`it do an error`)
            return e.toString()
        }
    },
    IMAGE_RESPONSE
)


// Get utf grid for some zxy bounds
// TODO: in the original implementation this alone uses cors: why?
api.get(
    '/grid/{z}/{x}/{y}',
    req => getGrid(req),
)

// Get tile for some zxy bounds
api.get(
    '/tile/{z}/{x}/{y}',
    req => getTile(req),
    IMAGE_RESPONSE,
)

// Handles favicon
// TODO: make one?
api.get('/favicon.ico', () => {
    // pass
})

// not es6-ic, but necessary for claudia to find the index
module.exports = api
