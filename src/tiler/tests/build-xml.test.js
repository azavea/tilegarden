import { exec } from 'child_process'

const executor = (input, env) => new Promise((resolve, reject) => {
    const command = `node scripts/template-vars.js '${input}'`
    exec(
        command,
        { env, },
        (err, stdout, stderr) => {
            if (err) reject(err)
            if (stderr) reject(stderr)
            resolve(stdout)
        }
    )
})

describe('fillTemplate', () => {
    test('append PROD_ in production', () => {
        const env = {
            ...process.env,
            NODE_ENV: 'production',
            PROD_TEST: 'success',
            DEV_TEST: 'failure',
        }
        const template = '${TEST}'

        expect.assertions(1)
        return executor(template, env).then(result => expect(result).toBe('"success"'))
    })

    test('append DEV_ in development', () => {
        const env = {
            ...process.env,
            NODE_ENV: 'development',
            PROD_TEST: 'failure',
            DEV_TEST: 'success',
        }
        const template = '${TEST}'
        expect.assertions(1)
        return executor(template, env).then(result => expect(result).toBe('"success"'))
    })

    test('default to DEV given any non-production NODE_ENV', () => {
        const env = {
            ...process.env,
            NODE_ENV: 'asdasdgdfgsdfgsdfg',
            PROD_TEST: 'failure',
            DEV_TEST: 'success',
        }
        const template = '${TEST}'
        expect.assertions(1)
        return executor(template, env).then(result => expect(result).toBe('"success"'))
    })

    test('default to DEV given no NODE_ENV', () => {
        const env = {
            ...process.env,
            PROD_TEST: 'failure',
            DEV_TEST: 'success',
        }
        const template = '${TEST}'
        expect.assertions(1)
        return executor(template, env).then(result => expect(result).toBe('"success"'))
    })
})
