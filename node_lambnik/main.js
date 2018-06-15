/**
 * Lambda framework entrypoint
 */

const APIBuilder = require('claudia-api-builder');

const api = new APIBuilder();

api.get('/', function () {
    return 'Hello, world!'
})

api.get('/{name}', function (request) {
    return 'Hello, ' + request.pathParams.name;
})

api.get('/echo', function (request) {
    return request;
})

module.exports = api;
