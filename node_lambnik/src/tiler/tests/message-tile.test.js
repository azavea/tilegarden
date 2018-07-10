import messageTile from '../bin/util/message-tile'

describe('messageTile', () => {
    test('can handle an arbitrary error', () => {
        expect.assertions(1)
        return expect(messageTile(new Error('This is an error!').toString())).resolves.not.toThrow()
    })
})
