import API from 'claudia-api-builder'

const api = new API()

api.get('/', () => 'Hello, world!')

api.get(
    '/greet/{name}',
    req => `Top 'o the mornin to ye, ${req.pathParams.name}.`,
)

// not es6-ic, but necessary for claudia to find the api
module.exports = api
