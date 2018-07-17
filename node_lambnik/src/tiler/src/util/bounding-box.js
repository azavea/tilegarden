/**
 * This function converts API coordinates to a [minX, minY, maxX, maxY]
 * bounding box in the target projection.
 *
 * Math I don't understand was borrowed from
 * https://github.com/mapbox/sphericalmercator/blob/e33a8c8bf852ea7a7c57d1f9001b581fce4b6590/sphericalmercator.js
 */

import mapnik from 'mapnik'

const R2D = 180 / Math.PI

const pxToWgs84Ll = (px, zoom, tileSize) => {
    const size = tileSize * (2 ** zoom)
    const bc = (size / 360)
    const cc = (size / (2 * Math.PI))
    const zc = size / 2
    const g = (px[1] - zc) / -cc
    const lon = (px[0] - zc) / bc
    const lat = R2D * ((2 * Math.atan(Math.exp(g))) - (0.5 * Math.PI))
    return [lon, lat]
}

export default (zoom, x, y, tileSize, projection) => {
    // convert pixels to wgs84 coordinates
    const ll = [x * tileSize, (y + 1) * tileSize]
    const ur = [(x + 1) * tileSize, y * tileSize]
    const wgs84Min = pxToWgs84Ll(ll, zoom, tileSize)
    const wgs84Max = pxToWgs84Ll(ur, zoom, tileSize)

    // convert wgs84 to map's srs
    const proj = new mapnik.Projection(projection)
    const convertedMin = proj.forward(wgs84Min)
    const convertedMax = proj.forward(wgs84Max)

    return convertedMin.concat(convertedMax)
}
