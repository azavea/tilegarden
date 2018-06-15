/**
 * Entrypoint for APIGateway
 */

import APIBuilder from 'claudia-api-builder'
import fs from 'fs'
import util from 'util'
import path from 'path'

const promiseReadFile = util.promisify(fs.readFile)

const api = new APIBuilder()

api.get('/', () => 'Hello, world!')
api.get('/test', () => 'testaroony')

api.get('/greet/{name}', request => `Hello, ${request.pathParams.name}!`)

api.get('/echo', request => request)

api.get(
    '/page.html',
    () => promiseReadFile(path.join(__dirname, 'page.html'), 'utf-8'),
    { success: { contentType: 'text/html' } },
)

api.setBinaryMediaTypes(['image/jpeg'])
api.get(
    '/img.jpg',
    () => promiseReadFile(path.join(__dirname, 'img.jpg')),
    {
        success: {
            contentType: 'image/jpeg',
            contentHandling: 'CONVERT_TO_BINARY',
        },
    },
)

// not es6-ic, but necessary for claudia to find the api
module.exports = api
