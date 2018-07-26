import rewire from 'rewire'
const api = rewire('../bin/api'),
    processCoords = api.__get__('processCoords'),
    processUTFQuery = api.__get__('processUTFQuery'),
    processLayers = api.__get__('processLayers')

describe('processCoords', () => {
    test('properly parses properly formatted coords', () => {
        const req = {
            pathParams: {
                x: '2385',
                y: '3103.png',
                z: '13'
            }
        }
        expect(processCoords(req)).toEqual({
            x: 2385,
            y: 3103,
            z: 13
        })
    })

    test('parses extensions other than png', () => {
        const req = {
            pathParams: {
                x: '2385',
                y: '3103.jpg',
                z: '13'
            }
        }
        const req2 = {
            pathParams: {
                x: '2385',
                y: '3103.pdf',
                z: '13'
            }
        }
        expect(processCoords(req)).toEqual({
            x: 2385,
            y: 3103,
            z: 13
        })
        expect(processCoords(req2)).toEqual({
            x: 2385,
            y: 3103,
            z: 13
        })
    })

    test('properly parses coords with no file extension', () => {
        const req = {
            pathParams: {
                x: '2385',
                y: '3103',
                z: '13'
            }
        }
        expect(processCoords(req)).toEqual({
            x: 2385,
            y: 3103,
            z: 13
        })
    })

    test('throws an error for non-numeral coords', () => {
        const req = {
            pathParams: {
                x: 'eggs',
                y: 'bacon',
                z: 'orange_juice'
            }
        }
        expect(() => processCoords(req)).toThrow()
    })
})

describe('processUTFQuery', () => {
    test('properly parses list of fields', () => {
        const req = {
            queryString: {
                utfFields: 'field1,field2,field3,field4'
            }
        }
        expect(processUTFQuery(req)).toEqual(['field1','field2','field3','field4'])
    })

    test('properly parses just one field', () => {
        const req = {
            queryString: {
                utfFields: 'field1'
            }
        }
        expect(processUTFQuery(req)).toEqual(['field1'])
    })

    test('properly parses no fields', () => {
        const req = {
            queryString: {}
        }
        expect(() => processUTFQuery(req)).toThrow()
    })

    test('properly parses a blank field', () => {
        const req = {
            queryString: {
                utfFields: ''
            }
        }
        expect(() => processUTFQuery(req)).toThrow()
    })
})

describe('processLayers', () => {
    test('properly parses list of layer', () => {
        const req = {
            queryString: {
                layers: 'layer1,layer2,layer3,layer4'
            }
        }
        expect(processLayers(req)).toEqual(['layer1','layer2','layer3','layer4'])
    })

    test('properly parses just one layer', () => {
        const req = {
            queryString: {
                layers: 'layer'
            }
        }
        expect(processLayers(req)).toEqual(['layer'])
    })

    test('properly parses no fields', () => {
        const req = {
            queryString: {}
        }
        expect(processLayers(req)).toEqual([])
    })

    test('properly parses a blank field', () => {
        const req = {
            queryString: {
                layers: ''
            }
        }
        expect(processLayers(req)).toEqual([])
    })
})
