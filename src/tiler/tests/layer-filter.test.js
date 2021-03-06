const rewire = require('rewire')

const filterLayers = require('../src/util/layer-filter')
const filterer = rewire('../src/util/layer-filter'),
    structureQuery = filterer.__get__('structureQuery')
const { parseXml, buildXml } = require('../src/util/xml-tools')

describe('structureQuery', () => {
    test('One value', () => {
        const layer = {
            name: 'layer',
            filters: [
                {
                    col: 'col',
                    val: 'val'
                }
            ]
        }
        const existingQuery = 'table'
        const expectedQuery = "(SELECT * FROM table WHERE \"col\" = 'val') as m"

        expect(structureQuery(existingQuery, layer)).toBe(expectedQuery)
    })

    test('Multiple values, no AND', () => {
        const layer = {
            name: 'layer',
            filters: [
                {
                    col: 'col',
                    val: 'val'
                },
                {
                    col: 'col',
                    val: 'val'
                }
            ]
        }
        const existingQuery = 'table'
        const expectedQuery = "(SELECT * FROM table WHERE \"col\" = 'val' AND \"col\" = 'val') as m"

        expect(structureQuery(existingQuery, layer)).toBe(expectedQuery)
    })

    test('Test AND', () => {
        const layer = {
            name: 'layer',
            mode: 'AND',
            filters: [
                {
                    col: 'col',
                    val: 'val'
                },
                {
                    col: 'col',
                    val: 'val'
                }
            ]
        }
        const existingQuery = 'table'
        const expectedQuery = "(SELECT * FROM table WHERE \"col\" = 'val' AND \"col\" = 'val') as m"

        expect(structureQuery(existingQuery, layer)).toBe(expectedQuery)
    })

    test('Test OR', () => {
        const layer = {
            name: 'layer',
            mode: 'OR',
            filters: [
                {
                    col: 'col',
                    val: 'val'
                },
                {
                    col: 'col',
                    val: 'val'
                }
            ]
        }
        const existingQuery = 'table'
        const expectedQuery = "(SELECT * FROM table WHERE \"col\" = 'val' OR \"col\" = 'val') as m"

        expect(structureQuery(existingQuery, layer)).toBe(expectedQuery)
    })

    test('Test non-allowed mode', () => {
        const layer = {
            name: 'layer',
            mode: 'XOR',
            filters: [
                {
                    col: 'col',
                    val: 'val'
                },
                {
                    col: 'col',
                    val: 'val'
                }
            ]
        }
        const existingQuery = 'table'
        const expectedQuery = "(SELECT * FROM table WHERE \"col\" = 'val' AND \"col\" = 'val') as m"

        expect(() => { structureQuery(existingQuery, layer) }).toThrow()
    })

    test('Test mathematical operator', () => {
        const layer = {
            name: 'layer',
            filters: [
                {
                    col: 'col',
                    val: 'val',
                    op: '>'
                },
            ]
        }
        const existingQuery = 'table'
        const expectedQuery = "(SELECT * FROM table WHERE \"col\" > 'val') as m"

        expect(structureQuery(existingQuery, layer)).toBe(expectedQuery)
    })

    test('Test other operator', () => {
        const layer = {
            name: 'layer',
            filters: [
                {
                    col: 'col',
                    val: 'val',
                    op: 'IS DISTINCT FROM'
                },
            ]
        }
        const existingQuery = 'table'
        const expectedQuery = "(SELECT * FROM table WHERE \"col\" IS DISTINCT FROM 'val') as m"

        expect(structureQuery(existingQuery, layer)).toBe(expectedQuery)
    })

    test('Test non-allowed operator', () => {
        const layer = {
            name: 'layer',
            filters: [
                {
                    col: 'col',
                    val: 'val',
                    op: 'IS ABOVE'
                },
            ]
        }
        const existingQuery = 'table'

        expect(() => { structureQuery(existingQuery, layer) }).toThrow()
    })
})

describe('filterLayers', () => {
    test('Just a string name', async () => {
        const layers = ['PWD']
        expect.assertions(1)

        const xml =
`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Map>
  <Layer name="PWD"/>
  <Layer name="STATE"/>
  <Layer name="AIRPRT"/>
</Map>`

        const expected =
`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Map>
  <Layer name="PWD"/>
  <Layer name="STATE" status="false"/>
  <Layer name="AIRPRT" status="false"/>
</Map>`
        const xmlJson = await parseXml(xml)
        return expect(filterLayers(xmlJson, layers).then(buildXml)).resolves.toBe(expected)
    })

    test('Several string names', async () => {
        const layers = ['PWD', 'STATE']
        expect.assertions(1)

        const xml =
            `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Map>
  <Layer name="PWD"/>
  <Layer name="STATE"/>
  <Layer name="AIRPRT"/>
</Map>`

        const expected =
            `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Map>
  <Layer name="PWD"/>
  <Layer name="STATE"/>
  <Layer name="AIRPRT" status="false"/>
</Map>`

        const xmlJson = await parseXml(xml)
        return expect(filterLayers(xmlJson, layers).then(buildXml)).resolves.toBe(expected)
    })

    test('Just an object name', async () => {
        const layers = [{name:'PWD'}]
        expect.assertions(1)

        const xml =
            `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Map>
  <Layer name="PWD"/>
  <Layer name="STATE"/>
  <Layer name="AIRPRT"/>
</Map>`

        const expected =
            `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Map>
  <Layer name="PWD"/>
  <Layer name="STATE" status="false"/>
  <Layer name="AIRPRT" status="false"/>
</Map>`

        const xmlJson = await parseXml(xml)
        return expect(filterLayers(xmlJson, layers).then(buildXml)).resolves.toBe(expected)
    })

    test('Several object names', async () => {
        const layers = [{name:'PWD'}, {name:'STATE'}]
        expect.assertions(1)

        const xml =
            `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Map>
  <Layer name="PWD"/>
  <Layer name="STATE"/>
  <Layer name="AIRPRT"/>
</Map>`

        const expected =
            `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Map>
  <Layer name="PWD"/>
  <Layer name="STATE"/>
  <Layer name="AIRPRT" status="false"/>
</Map>`

        const xmlJson = await parseXml(xml)
        return expect(filterLayers(xmlJson, layers).then(buildXml)).resolves.toBe(expected)
    })

    test('Object name + 1 filter', async () => {
        const layers = [{name:'PWD', filters: [{col:'owner', val:'PWD'}]}]
        expect.assertions(1)

        const xml =
            `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Map>
  <Layer name="PWD">
    <Datasource>
      <Parameter name="table">inlets</Parameter>
    </Datasource>
  </Layer>
  <Layer name="STATE"/>
  <Layer name="AIRPRT"/>
</Map>`

        const expected =
            `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Map>
  <Layer name="PWD">
    <Datasource>
      <Parameter name="table">(SELECT * FROM inlets WHERE "owner" = 'PWD') as m</Parameter>
    </Datasource>
  </Layer>
  <Layer name="STATE" status="false"/>
  <Layer name="AIRPRT" status="false"/>
</Map>`

        const xmlJson = await parseXml(xml)
        return expect(filterLayers(xmlJson, layers).then(buildXml)).resolves.toBe(expected)
    })

    test('Object name + 2 filters', async () => {
        const layers = [{name:'PWD', filters: [{col:'owner', val:'PWD'}, {col:'operator', val:'PWD'}]}]
        expect.assertions(1)

        const xml =
            `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Map>
  <Layer name="PWD">
    <Datasource>
      <Parameter name="table">inlets</Parameter>
    </Datasource>
  </Layer>
  <Layer name="STATE"/>
  <Layer name="AIRPRT"/>
</Map>`

        const expected =
            `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Map>
  <Layer name="PWD">
    <Datasource>
      <Parameter name="table">(SELECT * FROM inlets WHERE "owner" = 'PWD' AND "operator" = 'PWD') as m</Parameter>
    </Datasource>
  </Layer>
  <Layer name="STATE" status="false"/>
  <Layer name="AIRPRT" status="false"/>
</Map>`

        const xmlJson = await parseXml(xml)
        return expect(filterLayers(xmlJson, layers).then(buildXml)).resolves.toBe(expected)
    })

    test('dont filter if layer list is empty', async () => {
        const layers = []
        const xml =
`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Map>
  <Layer name="PWD"/>
  <Layer name="STATE"/>
  <Layer name="AIRPRT"/>
</Map>`
        expect.assertions(1)
        const xmlJson = await parseXml(xml)
        return expect(filterLayers(xmlJson, layers).then(buildXml)).resolves.toBe(xml)
    })

    test('dont filter if there is no layer list', async () => {
        const xml =
`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Map>
  <Layer name="PWD"/>
  <Layer name="STATE"/>
  <Layer name="AIRPRT"/>
</Map>`
        expect.assertions(1)
        const xmlJson = await parseXml(xml)
        return expect(filterLayers(xmlJson).then(buildXml)).resolves.toBe(xml)
    })

    test('Throw error if a layer doesn\'t exist', async () => {
        const layers = ['dog']
        expect.assertions(1)

        const xml =
            `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Map>
  <Layer name="PWD"/>
  <Layer name="STATE"/>
  <Layer name="AIRPRT"/>
</Map>`

        const xmlJson = await parseXml(xml)
        return expect(filterLayers(xmlJson, layers).then(buildXml)).rejects.toBeInstanceOf(Error)
    })
})

