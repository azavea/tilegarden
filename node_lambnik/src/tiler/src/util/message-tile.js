/**
 * Creates an image with nothing but an error description on it
 * so that users can actually receive error messages
 */
import Jimp from 'jimp'

const createImage = () => new Promise((resolve, reject) => {
    // eslint yells at me for using 'new' for side effects
    // (which I agree with) but this is how it's implemented
    /* eslint-disable-next-line no-new */
    new Jimp(256, 256, 0xffffffff, (err, image) => {
        if (err) reject(err)
        else resolve(image)
    })
})

const toBuffer = image => new Promise((resolve, reject) => {
    image.getBuffer(Jimp.MIME_PNG, (err, result) => {
        if (err) reject(err)
        else resolve(result)
    })
})

export default message => createImage()
    .then(tile => Jimp.loadFont(Jimp.FONT_SANS_16_BLACK)
        .then((font) => {
            tile.print(font, 10, 10, message, 246)
            return tile
        }))
    .then(toBuffer)
