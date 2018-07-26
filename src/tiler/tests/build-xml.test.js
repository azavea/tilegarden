import rewire from 'rewire'
const buildXML = rewire('../bin/util/build-xml'),
    fillTemplate = buildXML.__get__('fillTemplate')

describe('fillTemplate', () => {
    test('append PROD_ in production', () => {
        const env = {
            NODE_ENV: 'production',
            PROD_TEST: 'success',
            DEV_TEST: 'failure',
        }
        const template = '${TEST}'
        expect(fillTemplate(template, env)).toBe('"success"')
    })

    test('append DEV_ in development', () => {
        const env = {
            NODE_ENV: 'development',
            PROD_TEST: 'failure',
            DEV_TEST: 'success',
        }
        const template = '${TEST}'
        expect(fillTemplate(template, env)).toBe('"success"')
    })

    test('default to DEV given any non-production NODE_ENV', () => {
        const env = {
            NODE_ENV: 'asdasdgdfgsdfgsdfg',
            PROD_TEST: 'failure',
            DEV_TEST: 'success',
        }
        const template = '${TEST}'
        expect(fillTemplate(template, env)).toBe('"success"')
    })

    test('default to DEV given no NODE_ENV', () => {
        const env = {
            PROD_TEST: 'failure',
            DEV_TEST: 'success',
        }
        const template = '${TEST}'
        expect(fillTemplate(template, env)).toBe('"success"')
    })
})
