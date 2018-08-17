import HTTPError from '../bin/util/error-builder'

describe('Error builder', () => {
    test('Check that an HTTPError gets built properly', () => {
        const message = 'This function doesn\'t really need testing, but I want Jest to be happy.'
        const code = 401

        const error = HTTPError(message, code)
        expect(error).toBeInstanceOf(Error)
        expect(error.http_code).toBe(code)
        expect(error.message).toBe(message)
    })
})
