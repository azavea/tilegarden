import rewire from 'rewire'
const buildXML = rewire('../bin/util/build-xml'),
    fillTemplate = buildXML.__get__('fillTemplate')

describe('fillTemplate', () => {
    let env

    beforeEach(() => {
        env = Object.assign({}, process.env)
    })

    afterEach(() => {
        process.env = Object.assign({}, env)
    })

    test('basic substitution (prod)', () => {
        const env = {
            PROD_TEST: 'fish'
        }
        const template = '${TEST}'
        expect(fillTemplate(template, true, env)).toBe('"fish"')
    })

    test('basic substitution (dev)', () => {
        const env = {
            DEV_TEST: 'fish'
        }
        const template = '${TEST}'
        expect(fillTemplate(template, false, env)).toBe('"fish"')
    })

    test('case insensitivity (dev)', () => {
        const env = {
            DEV_test: 'fish'
        }
        const template = '${test}'
        expect(fillTemplate(template, false, env)).toBe('"fish"')
    })

    test('multiple templates', () => {
        const env = {
            DEV_TEST: 'fish',
            DEV_TOAST: 'flish',
            DEV_TRIST: 'flash',
        }
        const template = '${TEST}${TOAST}${TRIST}'
        expect(fillTemplate(template, false, env)).toBe('"fish""flish""flash"')
    })
})
