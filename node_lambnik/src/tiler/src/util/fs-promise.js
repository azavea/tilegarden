/**
 * Converts select asynchronous fs methods to promises
 */

import fs from 'fs'

export const readFile = (path, encoding) => new Promise((resolve, reject) => {
    fs.readFile(path, encoding, (err, result) => {
        if (err) reject(err)
        else resolve(result)
    })
})
