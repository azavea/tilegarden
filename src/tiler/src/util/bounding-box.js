/**
 * This function converts API coordinates to a [minX, minY, maxX, maxY]
 * bounding box in the target projection.
 */

import mapnik from 'mapnik'

const R2D = 180 / Math.PI

/**
 * Following code was borrowed from
 * https://github.com/mapbox/sphericalmercator/blob/e33a8c8bf852ea7a7c57d1f9001b581fce4b6590/sphericalmercator.js
 *
 * To get the bounding box (lower left and upper right corners in lon/lat)
 * for an arbitrary projection/tile size, the respective corners (in pixel count)
 * are converted first to lon/lat in WGS84 with pxToLonLat(). The corner lon/lats
 * are then reprojected to the target projection and then concatenated together
 * to get the [minX, minY, maxX, maxY] number array that Mapnik needs.
 */
const pxToLonLat = (px, zoom, tileSize) => {
    const size = tileSize * (2 ** zoom)
    const bc = (size / 360)
    const cc = (size / (2 * Math.PI))
    const zc = size / 2
    const g = (px[1] - zc) / -cc
    const lon = (px[0] - zc) / bc
    const lat = R2D * ((2 * Math.atan(Math.exp(g))) - (0.5 * Math.PI))
    return [lon, lat]
}

/**
 * @param zoom: zoom level of the tile
 * @param x
 * @param y
 * @param tileSize: in pixels (e.g. 256)
 * @param projection: as an srs
 * @returns [minX, minY, maxX, maxY]
 */
export default (zoom, x, y, tileSize, projection) => {
    // convert pixels to wgs84 coordinates
    const lowerLeft = [x * tileSize, (y + 1) * tileSize]
    const upperRight = [(x + 1) * tileSize, y * tileSize]
    const wgs84Min = pxToLonLat(lowerLeft, zoom, tileSize)
    const wgs84Max = pxToLonLat(upperRight, zoom, tileSize)

    // convert wgs84 to map's srs
    const proj = new mapnik.Projection(projection)
    const convertedMin = proj.forward(wgs84Min)
    const convertedMax = proj.forward(wgs84Max)

    return convertedMin.concat(convertedMax)
}
