/**
 * Accepts a string of XML and filters it to produce a string of XML where all layers not in
 * the list of enabled layers have their "status" property set to false, excluding them
 * from rendering.
 */

const { promisify } = require('util')
const sqlString = require('sql-escape-string')
const xmlParser = require('xml2js')

const HTTPError = require('./error-builder')

// Determine comparison mode (if more than one parameter)
const processMode = (mode, i) => {
    const MODES = ['AND', 'OR']

    if (i > 0) {
        if (mode) {
            if (MODES.includes(mode.toUpperCase())) {
                return mode.toUpperCase()
            }
            throw HTTPError(
                `Filter comparison mode '${mode}' is unsupported.`,
                405,
            )
        }
        return 'AND'
    }
    return ''
}

// Determine comparison operator
const processOp = (op) => {
    const OP_WHITELIST = ['=', '<', '>', '>=', '<=', '<>', '!=',
        'LIKE', 'IS', 'IS NOT', 'IS DISTINCT FROM', 'IS NOT DISTINCT FROM']

    if (op) {
        if (OP_WHITELIST.includes(op.toUpperCase())) {
            return op.toUpperCase()
        }
        throw HTTPError(`Operator '${op}' is unsupported.`, 405)
    }
    return '='
}

// Escape col but replace outer '-s with "-s to make a delimited identifier
const processCol = col => `"${sqlString(col).slice(1, -1)}"`

/**
 * Structures sql based on existing query and json options
 */
const structureQuery = (existingQuery, currentLayer) => {
    // Base of the query, wrapping pre-existing query
    let query = `SELECT * FROM ${existingQuery} WHERE`

    // Add each filter to the query string
    currentLayer.filters.forEach((filterObj, i) => {
        const mode = processMode(currentLayer.mode, i)
        const op = processOp(filterObj.op)
        const col = processCol(filterObj.col)
        const val = sqlString(filterObj.val)

        query += `${mode ? ` ${mode}` : ''} ` +
            `${col} ${op} ${val}`
    })

    // Wrap in variable and set in xml
    return `(${query}) as m`
}

/**
 * Set the status of each layer NOT in the list to false to disable
 */
const filter = (xmlJson, enabledLayers) => {
    let givenLayers = enabledLayers

    xmlJson.Map.Layer.forEach((layer) => {
        // Filter list of enabled layers by the name of the current layer
        const current = enabledLayers.filter(e => e === layer.$.name || e.name === layer.$.name)[0]

        // If there is no matching enabledLayers entry, disable the current layer
        if (!current) {
            /* eslint-disable-next-line no-param-reassign */
            layer.$.status = 'false'
        } else {
            // Remove layer from the list to mark it as "seen"
            givenLayers = givenLayers.filter(l => l !== current)

            // If there IS a matching entry, wrap SQL accordingly
            if (current.filters) {
                // This locates the query field in the data structure, trust me
                // also I'm sorry for how janked up this is
                const queryObj = layer.Datasource[0].Parameter.filter(p => p.$.name === 'table')[0]

                if (queryObj) {
                    queryObj._ = structureQuery(queryObj._, current)
                }
            }
        }
    })

    // If there are any layers left in enabledLayers, something's wrong
    if (givenLayers.length > 0) {
        throw HTTPError(
            `No layer(s) found with the name(s) '${JSON.stringify(givenLayers.join(', '))}'.`,
            400,
        )
    }

    return xmlJson
}

// Convert json back to an xml string
const returnToXml = (xmlJson) => {
    const builder = new xmlParser.Builder()
    return builder.buildObject(xmlJson)
}

module.exports = async (xmlString, enabledLayers) => {
    // skip entire process if no layers are to be parsed
    if (!enabledLayers || enabledLayers.length < 1) {
        return xmlString
    }

    const xmlJson = await promisify(xmlParser.parseString)(xmlString)
    return returnToXml(filter(xmlJson, enabledLayers))
}
