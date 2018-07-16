/**
 * This function converts coordinates to a bounding box of the given projection.
 */

import mapnik from 'mapnik'

const R2D = 180 / Math.PI

const pxToWgs84Ll = (px, zoom, tileSize) => {
    var size = tileSize * Math.pow(2, zoom);
    var bc = (size / 360);
    var cc = (size / (2 * Math.PI));
    var zc = size / 2;
    var g = (px[1] - zc) / -cc;
    var lon = (px[0] - zc) / bc;
    var lat = R2D * (2 * Math.atan(Math.exp(g)) - 0.5 * Math.PI);
    return [lon, lat];
}

export default (zoom, x, y, tileSize, projection, useTmsScheme) => {
    if (useTmsScheme) {
        y = (Math.pow(2, zoom) - 1) - y
    }

    // convert pixels to wgs84 coordinates
    const ll = [x * tileSize, (y + 1) * tileSize]
    const ur = [(x + 1) * tileSize, y * tileSize]
    const WGS84min = pxToWgs84Ll(ll, zoom, tileSize)
    const WGS84max = pxToWgs84Ll(ur, zoom, tileSize)

    const proj = new mapnik.Projection(projection)
    // convert wgs84 to map's srs
    const convertedMin = proj.forward(WGS84min)
    const convertedMax = proj.forward(WGS84max)

    return convertedMin.concat(convertedMax)
}
