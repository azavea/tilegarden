/* Helper functions to encapsulate converting to and from XML.
 *
 * There's not much here, but it does get reused, and having it centralized should make it
 * easier to change libraries or settings if necessary.
 */

const { promisify } = require('util')
const xml2js = require('xml2js')

// Make an async-friendly version of the parser
const parsePromise = promisify(xml2js.parseString)

async function parseXml(xmlString) {
    return parsePromise(xmlString)
}

function buildXml(xmlJsObj) {
    const builder = new xml2js.Builder()
    return builder.buildObject(xmlJsObj)
}

module.exports = {
    parseXml,
    buildXml,
}
