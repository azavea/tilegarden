import filterLayers from '../bin/util/layer-filter'

describe('filterLayers', () => {
    test('Most basic possible XML', () => {
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

        return expect(filterLayers(xml, layers)).resolves.toBe(expected)
    })

    test('dont filter if layer list is empty', () => {
        const layers = []
        const xml =
`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Map>
  <Layer name="PWD"/>
  <Layer name="STATE"/>
  <Layer name="AIRPRT"/>
</Map>`
        expect.assertions(1)
        return expect(filterLayers(xml, layers)).resolves.toBe(xml)
    })

    test('dont filter if there is no layer list', () => {
        const xml =
`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Map>
  <Layer name="PWD"/>
  <Layer name="STATE"/>
  <Layer name="AIRPRT"/>
</Map>`
        expect.assertions(1)
        return expect(filterLayers(xml)).resolves.toBe(xml)
    })

    test('Throw error if a layer doesn\'t exist', () => {
        const layers = ['dog']
        expect.assertions(1)

        const xml =
            `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Map>
  <Layer name="PWD"/>
  <Layer name="STATE"/>
  <Layer name="AIRPRT"/>
</Map>`

        return expect(filterLayers(xml, layers)).rejects.toBeInstanceOf(Error)
    })
})

