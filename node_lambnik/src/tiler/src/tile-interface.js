/**
 * Handles accepting requests from the api
 * and sending responses using mapnik
 *
 * TODO: this module could use a better name?
 */

import path from 'path'
import fs from 'fs'

import { image, grid } from './tiler'

const handleException = (e) => {
    return e.toString()
}

// default landing page response
export const home = () => {
    return 'Hello, world!'
}

export const getGrid = async (req) => {
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
    try {
        // Handle url params
        const inlet = req.queryString.inlet
        const z = Number(req.pathParams.z)
        const x = Number(req.pathParams.x)
        // strip .png off of y
        const preY = req.pathParams.y
        const y = Number(preY.substr(0, preY.lastIndexOf('.')) || preY)

        // get tile buffer
        const tile = await image(z, x, y, inlet)

        // send buffer to client
        return tile

    } catch (e) {
        return handleException(e)
    }
}

// For debugging: write image buffer to file
const saveTiletoFile = (buffer, path) => {
    const dir = path.join(__dirname, '../tiles/')
    if ( !fs.existsSync(dir)) fs.mkdirSync(dir)
    fs.writeFileSync(`${dir}${path}`, buffer)
    console.log(`Wrote tile ${path} to ${dir}`)
}
