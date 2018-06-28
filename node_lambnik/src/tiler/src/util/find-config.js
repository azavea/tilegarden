/**
 * Dynamically provides path to mapnik config file based on current NODE_ENV
 */

import path from 'path'

export default () => {
    return path.join(__dirname, `../config/map-config.${(process.env.NODE_ENV === 'development') ? 'dev' : 'prod'}.mml`)
}
