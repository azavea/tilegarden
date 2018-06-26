/**
 * Handles accepting requests from the api
 * and sending responses using mapnik
 *
 * TODO: this module could use a better name?
 */

import path from 'path'
import fs from 'fs'

import { image, grid } from './tiler'
import { TILE_PATH, GRID_PATH } from './path-config'

const handleException = (e) => {
    return e.toString()
}

// default landing page response
export const home = () => {
    return `
        <html>
            <head>
            <title>Tilegarden</title>
            </head>
            <body>
                <h2>Tilegarden Usage:</h2>
                <ul>
                    <li>Render tile at zoom/x/y: <code>${TILE_PATH}</code></li>
                    <li>UTF grid at zoom/x/y: <code>${GRID_PATH}</code></li>
                </ul>
                <a href="https://github.com/azavea/tilegarden">See on GitHub</a>
            </body>
        </html>
    `
}

// img endpoint to verify binary content serving
export const img = () => new Promise((resolve, reject) => {
    fs.readFile(path.join(__dirname, 'res/img.png'), (err, data) => {
        if (err) reject(err)
        else resolve(data)
    })
})

export const getGrid = (req) => {
    // Handle url params
    const z = Number(req.pathParams.z)
    const x = Number(req.pathParams.x)
    const y = Number(req.pathParams.y)

    // create grid
    return grid(z, x, y)
        .then(result => result)
        .catch(e => JSON.stringify(e))
}

export const getImage = async (req) => {
    // Handle url params
    const z = Number(req.pathParams.z)
    const x = Number(req.pathParams.x)
    // strip .png off of y
    const preY = req.pathParams.y
    const y = Number(preY.substr(0, preY.lastIndexOf('.')) || preY)

    // return tile buffer to client
    return image(z, x, y)
        .then(result => result)
        .catch(e => JSON.stringify(e))
}

// For debugging: write image buffer to file
const saveTiletoFile = (buffer, path) => {
    const dir = path.join(__dirname, '../tiles/')
    if ( !fs.existsSync(dir)) fs.mkdirSync(dir)
    fs.writeFileSync(`${dir}${path}`, buffer)
    console.log(`Wrote tile ${path} to ${dir}`)
}
