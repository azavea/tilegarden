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

// img endpoint to verify binary content serving
export const img = () => new Promise((resolve, reject) => {
    fs.readFile(path.join(__dirname, 'res/img.png'), (err, data) => {
        if (err) reject(err)
        else resolve(data)
    })
})

export const getGrid = (req) => {
    try {
        // Handle url params
        const z = Number(req.pathParams.z)
        const x = Number(req.pathParams.x)
        const y = Number(req.pathParams.y)

        // create grid
        return grid(z, x, y)
    } catch (e) {
        return handleException(e)
    }
}

export const getImage = async (req) => {
    try {
        // Handle url params
        const z = Number(req.pathParams.z)
        const x = Number(req.pathParams.x)
        // strip .png off of y
        const preY = req.pathParams.y
        const y = Number(preY.substr(0, preY.lastIndexOf('.')) || preY)

        // return tile buffer to client
        return image(z, x, y)

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
