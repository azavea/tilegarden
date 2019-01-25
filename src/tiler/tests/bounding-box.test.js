const bbox = require('../src/util/bounding-box')

describe('boundingBox', () => {
    const tileSize = 256,
        testX = 2385,
        testY = 3103,
        testZoom = 13

    test('Handle output to WGS84', () => {
        const projection = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs"
        const target = [
            -75.1904296875,
            39.90973623453719,
            -75.146484375,
            39.9434364619742
        ]

        bbox(testZoom, testX, testY, tileSize, projection).forEach((val, i) => expect(val).toBe(target[i], 1))
    })

    test('Handle output to 900913', () => {
        const projection = "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs"

        const target = [
            -8370160.34,
            4852834.04,
            -8365268.38,
            4857726.03
        ]

        bbox(testZoom, testX, testY, tileSize, projection).forEach((val, i) => expect(val).toBeCloseTo(target[i], 1))
    })

    test('Handle output to 2272', () => {
        const projection = "+proj=lcc +lat_1=39.93333333333333 +lat_2=40.96666666666667 +lat_0=39.33333333333334 +lon_0=-77.75 +x_0=600000 +y_0=0 +datum=NAD83 +units=us-ft +no_defs"

        const target = [
            2686442.41811553,
            220380.94455046,
            2698403.39521981,
            233012.37911430
        ]

        bbox(testZoom, testX, testY, tileSize, projection).forEach((val, i) => expect(val).toBeCloseTo(target[i], 1))
    })
})
