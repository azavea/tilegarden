import mapnik from 'mapnik'

const R2D = 180 / Math.PI

/**
 * @author https://github.com/mapbox/sphericalmercator/blob/e33a8c8bf852ea7a7c57d1f9001b581fce4b6590/sphericalmercator.js
 * @description Code borrowed from https://github.com/mapbox/sphericalmercator/blob/e33a8c8bf852ea7a7c57d1f9001b581fce4b6590/sphericalmercator.js
 * @function pxToLonLat
 * @private
 * @param {number} px - Starting pixel size.
 * @param {number} zoom - Target zoom level.
 * @param {number} tileSize - Tile size in pixels.
 * @returns {number[]} Coordinate in the form [lon, lat].
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
 * @description To get the bounding box (lower left and upper right corners in lon/lat) for an arbitrary projection/tile size, the respective corners (in pixel count) are converted first to lon/lat in WGS84 with pxToLonLat(). The corner lon/lats are then reprojected to the target projection and then concatenated together to get the [minX, minY, maxX, maxY] number array that Mapnik needs.
 * @function bbox
 * @public
 * @param {number} zoom - Tile zoom level.
 * @param {number} x - Tile x-coordinate.
 * @param {number} y - Tile y-coordinate.
 * @param {number} tileSize - Size of the tile, in pixels.
 * @param {string} projection - SRS of the target projection of the tile.
 * @returns {number[]} Bounding box of the form [minX, minY, maxX, maxY].
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
