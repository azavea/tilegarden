import API from 'claudia-api-builder'

const api = new API()

api.get('/', () => 'Hello')

// not es6-ic, but necessary for claudia to find the api
module.exports = api
