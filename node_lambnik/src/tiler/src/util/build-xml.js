/**
 * This script uses carto to compile templated MML files
 * to XML that mapnik can understand
 */

import carto from 'carto'
import path from 'path'
import mkdirp from 'mkdirp'

import { readFile, writeFile } from './fs-promise'

const IN_FILE = process.argv[2]
const OUT_FILE = process.argv[3]
const NODE_ENV = process.env.NODE_ENV === 'production'
console.log(`Production mode=${NODE_ENV}`)

// Takes in a string and templates in the proper env variables
const fillTemplate = (mmlString) => {
    return mmlString.replace(/\$\{[a-z0-9_]+\}/gi, (match) => {
        const varName = `${(NODE_ENV) ? 'PROD_' : 'DEV_'}${match.slice(2, match.length -1)}`
        return `"${process.env[varName]}"`
    })
}

// Loads properly formatted MML into an MML object
const loadMML = (fullMML) => {
    return new Promise((resolve, reject) => {
        const mml = new carto.MML({})

        // Carto CAN read MSSs from file, which is why it
        // needs the directory of the MML file (for relative path calculation)
        mml.load(path.dirname(IN_FILE), fullMML, (err, data) => {
            if (err) reject(err)
            else resolve(data)
        })
    })
}

// Converts an MML object to XML
const mmlToXML = (mml) => {
    // MML.load is asynchronous, but render is NOT, and you have to
    // manually check for errors by checking the members of the result
    const jsonResponse = new carto.Renderer({}).render(mml)

    if (jsonResponse.msg) {
        jsonResponse.msg.forEach(m => console.log(carto.Util.getMessageToPrint(m)))
    }

    if (jsonResponse.data) return jsonResponse.data

    // Actually throw an error if no data result
    console.log(jsonResponse)
    throw new Error('Error: could not render MML to XML, no result from render()')
}

readFile(IN_FILE, 'utf-8')
    .then(fillTemplate)
    .then(loadMML)
    .then(mmlToXML)
    .then(xml => new Promise((resolve, reject) => {
        mkdirp(path.dirname(OUT_FILE), (err) => {
            if (err) reject(err)
            else resolve(xml)
        })
    }))
    .then(xml => writeFile(OUT_FILE, xml, 'utf-8'))
    .then(() => console.log(`Successfully wrote ${IN_FILE} to ${OUT_FILE}`))
    .catch(e => console.error(e))
