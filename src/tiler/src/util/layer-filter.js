/**
 * Specifies a promise that accepts a string of XML and resolves
 * to a string of XML where all layers not in the list of enabled
 * layers have their "status" property set to false, excluding them
 * from rendering.
 */

import xmlParser from 'xml2js'

// Promisified conversion of an xml string to a JSON object
const parsePromise = xmlString => new Promise((resolve, reject) => {
    xmlParser.parseString(xmlString, (err, result) => {
        if (err) reject(err)
        else resolve(result)
    })
})

/**
 * Set the status of each layer NOT in the list to false to disable
 */
const filter = (xmlJson, enabledLayers) => {
    xmlJson.Map.Layer.forEach((layer) => {
        /* eslint-disable-next-line no-param-reassign */
        if (!enabledLayers.includes(layer.$.name)) layer.$.status = 'false'
    })
    return xmlJson
}

// Convert json back to an xml string
const returnToXml = (xmlJson) => {
    const builder = new xmlParser.Builder()
    return builder.buildObject(xmlJson)
}

export default (xmlString, enabledLayers) => {
    // skip entire process if no layers are to be parsed
    if (!enabledLayers || enabledLayers.length < 1) {
        return new Promise(resolve => resolve(xmlString))
    }

    return parsePromise(xmlString)
        .then(xmlJson => filter(xmlJson, enabledLayers))
        .then(returnToXml)
}

