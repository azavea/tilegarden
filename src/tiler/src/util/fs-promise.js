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

export const writeFile = (path, data, encoding) => new Promise((resolve, reject) => {
    fs.writeFile(path, data, encoding, (err) => {
        if (err) reject(err)
        // Real fs writeFile doesn't resolve to anything, but not
        // resolving was breaking my promise chains
        else resolve(path)
    })
})

export const readDir = directory => new Promise((resolve, reject) => {
    fs.readdir(directory, (err, files) => {
        if (err) reject(err)
        else resolve(files)
    })
})
