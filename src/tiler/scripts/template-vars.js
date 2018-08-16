/**
 * Stub script that places variable templates with the proper env variable.
 * In all likelihood this could be done with one line of sed but I was having
 * trouble getting the string replacement part to work out.
 */

const fs = require('fs')

const envPrefix = process.env.NODE_ENV === 'production' ? 'PROD_' : 'DEV_'

fs.readFile(process.argv[2], 'utf-8', function (err, out) {
    if (err) process.stderr.write(err)
    else {
        const templated = out.replace(
            /\$\{([a-z0-9_]+)\}/gi,
            (_, envName) => {
                const varName = `${envPrefix}${envName}`
                return `"${process.env[varName]}"`
            },
        )

        process.stdout.write(templated)
    }
})


