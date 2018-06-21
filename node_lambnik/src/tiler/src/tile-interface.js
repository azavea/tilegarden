/**
 * Handles accepting requests from the api
 * and sending responses using mapnik
 *
 * TODO: this module could use a better name?
 */

import Bunyan from 'bunyan'
import path from 'path'
import fs from 'fs'

import { image, grid } from './tiler'

// Configure logging
const log = Bunyan.createLogger({ name: 'Tilegarden' })


// TODO: flesh out how errors are handled
const handleException = (e) => {
    log.error(e)
    return e.toString()
}

// default landing page response
// TODO: have this return usage instructions?
export const home = () => {
    log.debug('Hello, world!')
    return 'Hello, world!'
}

export const getGrid = async (req) => {
    log.debug('Serving grid')

    try {
        // Handle url params
        const inlet = req.queryString.inlet
        const z = Number(req.pathParams.z)
        const x = Number(req.pathParams.x)
        const y = Number(req.pathParams.y)

        // create grid
        return await grid(z, x, y, inlet)
    } catch (e) {
        return handleException(e)
    }
}

export const getImage = async (req) => {
    log.debug('Serving tile')

    try {
        // Handle url params
        const inlet = req.queryString.inlet
        const z = Number(req.pathParams.z)
        const x = Number(req.pathParams.x)
        const y = Number(req.pathParams.y)

        // get tile buffer
        const tile = await image(z, x, y, inlet)

        // DEBUG: write buffer to file
        const dir = path.join(__dirname, '../tiles/')
        if ( !fs.existsSync(dir)) fs.mkdirSync(dir)
        fs.writeFileSync(`${dir}tile${z}${x}${y}.png`, tile)
        console.log(`Wrote tile ${z}/${x}/${y}.png to ${dir}`)

        // send buffer to client
        return tile

    } catch (e) {
        return handleException(e)
    }
}
