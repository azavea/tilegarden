import rewire from 'rewire'
const tiler = rewire('../bin/tiler.js'),
    filterLayers = tiler.__get__('filterLayers')

describe('filterLayers', () => {
    test('string with 1/1 filter cases', () => {
        const xml = '<Layer name="PWD">'
        const layers = ['PWD']
        expect(filterLayers(xml, layers))
            .toBe('<Layer name="PWD" status="0">')
    })

    test('string with 1/x filter cases', () => {
        const xml = '<Layer name="PWD"><Layer name="STATE"><Layer name="NAVY">'
        const layers = ['PWD']
        expect(filterLayers(xml, layers))
            .toBe('<Layer name="PWD" status="0"><Layer name="STATE"><Layer name="NAVY">')
    })

    test('string with multiple filter cases', () => {
        const xml = '<Layer name="PWD"><Layer name="STATE"><Layer name="NAVY">'
        const layers = ['PWD', 'STATE']
        expect(filterLayers(xml, layers))
            .toBe('<Layer name="PWD" status="0"><Layer name="STATE" status="0"><Layer name="NAVY">')
    })

    test('string with all filter cases', () => {
        const xml = '<Layer name="PWD"><Layer name="STATE"><Layer name="NAVY">'
        const layers = ['PWD', 'STATE']
        expect(filterLayers(xml, layers))
            .toBe('<Layer name="PWD" status="0"><Layer name="STATE" status="0"><Layer name="NAVY" status="0">')
    })

    test('string with 0 filter cases', () => {
        const xml = '<Layer name="PWD"><Layer name="STATE"><Layer name="NAVY">'
        const layers = []
        expect(filterLayers(xml, layers))
            .toBe('<Layer name="PWD"><Layer name="STATE"><Layer name="NAVY">')
    })
})




const REAL_XML = '<?xml version="1.0" encoding="utf-8"?>\n' +
    '<!DOCTYPE Map[]>\n' +
    '<Map srs="+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs +over">\n' +
    '  <Parameters>\n' +
    '    <Parameter name="name"><![CDATA[Tilegarden Configuration]]></Parameter>\n' +
    '    <Parameter name="description"><![CDATA[Carto MML file to configure Tilegarden settings]]></Parameter>\n' +
    '    <Parameter name="format"><![CDATA[png]]></Parameter>\n' +
    '  </Parameters>\n' +
    '  <Style filter-mode="first" name="PWD">\n' +
    '    <Rule>\n' +
    '      <MarkersSymbolizer allow-overlap="true" fill="#0000ff" width="4" />\n' +
    '    </Rule>\n' +
    '  </Style>\n' +
    '  <Layer name="PWD">\n' +
    '    <StyleName><![CDATA[PWD]]></StyleName>\n' +
    '    <Datasource>\n' +
    '      <Parameter name="host"><![CDATA[undefined]]></Parameter>\n' +
    '      <Parameter name="dbname"><![CDATA[undefined]]></Parameter>\n' +
    '      <Parameter name="user"><![CDATA[undefined]]></Parameter>\n' +
    '      <Parameter name="password"><![CDATA[undefined]]></Parameter>\n' +
    '      <Parameter name="type"><![CDATA[postgis]]></Parameter>\n' +
    '      <Parameter name="table"><![CDATA[(select geom,owner,inlettype from pwd_inlets where owner = \'PWD\') as q]]></Parameter>\n' +
    '      <Parameter name="key_field"><![CDATA[]]></Parameter>\n' +
    '      <Parameter name="geometry_field"><![CDATA[geom]]></Parameter>\n' +
    '    </Datasource>\n' +
    '  </Layer>\n' +
    '  <Style filter-mode="first" name="AIRPRT">\n' +
    '    <Rule>\n' +
    '      <MarkersSymbolizer allow-overlap="true" fill="#ffffff" width="4" />\n' +
    '    </Rule>\n' +
    '  </Style>\n' +
    '  <Layer name="AIRPRT">\n' +
    '    <StyleName><![CDATA[AIRPRT]]></StyleName>\n' +
    '    <Datasource>\n' +
    '      <Parameter name="host"><![CDATA[undefined]]></Parameter>\n' +
    '      <Parameter name="dbname"><![CDATA[undefined]]></Parameter>\n' +
    '      <Parameter name="user"><![CDATA[undefined]]></Parameter>\n' +
    '      <Parameter name="password"><![CDATA[undefined]]></Parameter>\n' +
    '      <Parameter name="type"><![CDATA[postgis]]></Parameter>\n' +
    '      <Parameter name="table"><![CDATA[(select geom,owner,inlettype from pwd_inlets where owner = \'AIRPRT\') as q]]></Parameter>\n' +
    '      <Parameter name="key_field"><![CDATA[]]></Parameter>\n' +
    '      <Parameter name="geometry_field"><![CDATA[geom]]></Parameter>\n' +
    '    </Datasource>\n' +
    '  </Layer>\n' +
    '  <Style filter-mode="first" name="STATE">\n' +
    '    <Rule>\n' +
    '      <MarkersSymbolizer allow-overlap="true" fill="#808080" width="4" />\n' +
    '    </Rule>\n' +
    '  </Style>\n' +
    '  <Layer name="STATE">\n' +
    '    <StyleName><![CDATA[STATE]]></StyleName>\n' +
    '    <Datasource>\n' +
    '      <Parameter name="host"><![CDATA[undefined]]></Parameter>\n' +
    '      <Parameter name="dbname"><![CDATA[undefined]]></Parameter>\n' +
    '      <Parameter name="user"><![CDATA[undefined]]></Parameter>\n' +
    '      <Parameter name="password"><![CDATA[undefined]]></Parameter>\n' +
    '      <Parameter name="type"><![CDATA[postgis]]></Parameter>\n' +
    '      <Parameter name="table"><![CDATA[(select geom,owner,inlettype from pwd_inlets where owner = \'STATE\') as q]]></Parameter>\n' +
    '      <Parameter name="key_field"><![CDATA[]]></Parameter>\n' +
    '      <Parameter name="geometry_field"><![CDATA[geom]]></Parameter>\n' +
    '    </Datasource>\n' +
    '  </Layer>\n' +
    '  <Style filter-mode="first" name="PARK">\n' +
    '    <Rule>\n' +
    '      <MarkersSymbolizer allow-overlap="true" fill="#008000" width="4" />\n' +
    '    </Rule>\n' +
    '  </Style>\n' +
    '  <Layer name="PARK">\n' +
    '    <StyleName><![CDATA[PARK]]></StyleName>\n' +
    '    <Datasource>\n' +
    '      <Parameter name="host"><![CDATA[undefined]]></Parameter>\n' +
    '      <Parameter name="dbname"><![CDATA[undefined]]></Parameter>\n' +
    '      <Parameter name="user"><![CDATA[undefined]]></Parameter>\n' +
    '      <Parameter name="password"><![CDATA[undefined]]></Parameter>\n' +
    '      <Parameter name="type"><![CDATA[postgis]]></Parameter>\n' +
    '      <Parameter name="table"><![CDATA[(select geom,owner,inlettype from pwd_inlets where owner = \'PARK\') as q]]></Parameter>\n' +
    '      <Parameter name="key_field"><![CDATA[]]></Parameter>\n' +
    '      <Parameter name="geometry_field"><![CDATA[geom]]></Parameter>\n' +
    '    </Datasource>\n' +
    '  </Layer>\n' +
    '  <Style filter-mode="first" name="LM">\n' +
    '    <Rule>\n' +
    '      <MarkersSymbolizer allow-overlap="true" fill="#000000" width="4" />\n' +
    '    </Rule>\n' +
    '  </Style>\n' +
    '  <Layer name="LM">\n' +
    '    <StyleName><![CDATA[LM]]></StyleName>\n' +
    '    <Datasource>\n' +
    '      <Parameter name="host"><![CDATA[undefined]]></Parameter>\n' +
    '      <Parameter name="dbname"><![CDATA[undefined]]></Parameter>\n' +
    '      <Parameter name="user"><![CDATA[undefined]]></Parameter>\n' +
    '      <Parameter name="password"><![CDATA[undefined]]></Parameter>\n' +
    '      <Parameter name="type"><![CDATA[postgis]]></Parameter>\n' +
    '      <Parameter name="table"><![CDATA[(select geom,owner,inlettype from pwd_inlets where owner = \'LM\') as q]]></Parameter>\n' +
    '      <Parameter name="key_field"><![CDATA[]]></Parameter>\n' +
    '      <Parameter name="geometry_field"><![CDATA[geom]]></Parameter>\n' +
    '    </Datasource>\n' +
    '  </Layer>\n' +
    '  <Style filter-mode="first" name="FEDERAL">\n' +
    '    <Rule>\n' +
    '      <MarkersSymbolizer allow-overlap="true" fill="#ff0000" width="4" />\n' +
    '    </Rule>\n' +
    '  </Style>\n' +
    '  <Layer name="FEDERAL">\n' +
    '    <StyleName><![CDATA[FEDERAL]]></StyleName>\n' +
    '    <Datasource>\n' +
    '      <Parameter name="host"><![CDATA[undefined]]></Parameter>\n' +
    '      <Parameter name="dbname"><![CDATA[undefined]]></Parameter>\n' +
    '      <Parameter name="user"><![CDATA[undefined]]></Parameter>\n' +
    '      <Parameter name="password"><![CDATA[undefined]]></Parameter>\n' +
    '      <Parameter name="type"><![CDATA[postgis]]></Parameter>\n' +
    '      <Parameter name="table"><![CDATA[(select geom,owner,inlettype from pwd_inlets where owner = \'FEDERAL\') as q]]></Parameter>\n' +
    '      <Parameter name="key_field"><![CDATA[]]></Parameter>\n' +
    '      <Parameter name="geometry_field"><![CDATA[geom]]></Parameter>\n' +
    '    </Datasource>\n' +
    '  </Layer>\n' +
    '  <Style filter-mode="first" name="PRIV">\n' +
    '    <Rule>\n' +
    '      <MarkersSymbolizer allow-overlap="true" fill="#ffff00" width="4" />\n' +
    '    </Rule>\n' +
    '  </Style>\n' +
    '  <Layer name="PRIV">\n' +
    '    <StyleName><![CDATA[PRIV]]></StyleName>\n' +
    '    <Datasource>\n' +
    '      <Parameter name="host"><![CDATA[undefined]]></Parameter>\n' +
    '      <Parameter name="dbname"><![CDATA[undefined]]></Parameter>\n' +
    '      <Parameter name="user"><![CDATA[undefined]]></Parameter>\n' +
    '      <Parameter name="password"><![CDATA[undefined]]></Parameter>\n' +
    '      <Parameter name="type"><![CDATA[postgis]]></Parameter>\n' +
    '      <Parameter name="table"><![CDATA[(select geom,owner,inlettype from pwd_inlets where owner = \'PRIV\') as q]]></Parameter>\n' +
    '      <Parameter name="key_field"><![CDATA[]]></Parameter>\n' +
    '      <Parameter name="geometry_field"><![CDATA[geom]]></Parameter>\n' +
    '    </Datasource>\n' +
    '  </Layer>\n' +
    '</Map>\n'
