/**
 * This script uses carto to compile templated MML files
 * to XML that mapnik can understand. This script is only run prior
 * to deployment, so it makes use of some devDependencies that won't
 * exist in production. Under no circumstances should this be
 * run in production (unless you make Carto a regular dependency).
 */

/* eslint-disable no-console */

/* eslint-disable-next-line import/no-extraneous-dependencies */
import carto from 'carto'
import path from 'path'

// Takes in a string and templates in the proper env variables
/**
 * Variables are templated in to MML using custom bash-like syntax.
 * If the needs of the project become more complicated, this should
 * be changed to a defined YAML templating convention and/or use a
 * templating library, rather than add new nuances to this
 * implementation.
 */
const fillTemplate = (mmlString, env) => new Promise((resolve) => {
    try {
        const envPrefix = env.NODE_ENV === 'production' ? 'PROD_' : 'DEV_'

        const templated = mmlString.replace(
            /\$\{([a-z0-9_]+)\}/gi,
            (_, envName) => {
                const varName = `${envPrefix}${envName}`
                return `"${env[varName]}"`
            },
        )

        resolve(templated)
    } catch (e) {
        reject(e)
    }

})


// Loads properly formatted MML into an MML object
const loadMML = (fullMML, fileName) => new Promise((resolve, reject) => {
    const mml = new carto.MML({})

    // Carto CAN read MSSs from file, which is why it
    // needs the directory of the MML file (for relative path calculation)
    console.log(fileName)
    mml.load(path.dirname(fileName), fullMML, (err, data) => {
        if (err) reject(err)
        else resolve(data)
    })
})


// Converts an MML object to an XML string
const mmlToXML = (mml) => {
    // MML.load is asynchronous, but render is NOT, and you have to
    // manually check for errors by checking the members of the result
    const jsonResponse = new carto.Renderer({}).render(mml)

    if (jsonResponse.msg) {
        jsonResponse.msg.forEach(m =>
            console.log(carto.Util.getMessageToPrint(m)))
    }

    if (jsonResponse.data) return jsonResponse.data

    // Actually throw an error if no data result
    throw new Error('Error: could not render MML to XML, no result from render()')
}

const fileName = process.argv[2]
const fileContent = process.argv[3]

fillTemplate(fileContent, process.env)
    .then(fullMML => loadMML(fullMML, fileName))
    .then(mmlToXML)
    .then(xml => console.log(xml))
    .catch(e => console.error(e))
