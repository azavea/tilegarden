/**
 * Entrypoint for Windshaft server
 * Copy-paste of example from Azavea Windshaft repo
 */

var Windshaft = require('windshaft');

// Configure pluggable URLs
// =========================
// The config object must define grainstore config (generally just
// postgres connection details), redis config, a base url and a function
// that adds 'dbname' and 'table' variables onto the Express.js req.params
// object.  In this example, the base URL is such that dbname and table will
// automatically be added to the req.params object by express.js. req2params
// can be extended to allow full control over the specifying of dbname and
// table, and also allows for the req.params object to be extended with
// other variables, such as:
//
// * sql - custom sql query to narrow results shown in map)
// * geom_type - specify the geom type (point|polygon) to get more
//               appropriate default styles
// * cache_buster - forces the creation of a new render object, nullifying
//                  existing metatile caches
// * interactivity - specify the column to use in the UTFGrid
//                   interactivity layer (defaults to null)
// * style - specify map style in the Carto map language on a per tile basis
//
// the base url is also used for persisiting and retrieving map styles via:
//
// GET  base_url + '/style' (returns a map style)
// POST base_url + '/style' (allows specifying of a style in Carto markup
//                           in the 'style' form variable).
//
// beforeTileRender and afterTileRender could be defined if you want yo
// implement your own tile cache policy. See an example below

var config = {
        base_url: '/database/:dbname/table/:table',
        base_url_mapconfig: '/database/:dbname/layergroup',
        req2params: function(req, callback){
          callback(null,req)
        },
        grainstore: {
          datasource: {
            user:'postgres', host: 'db',
        		port: 5432
          }
        }, //see grainstore npm for other options
        renderCache: {
          ttl: 60000, // seconds
        },
        mapnik: {
          metatile: 4,
          bufferSize:64
        },
        redis: {host: 'redis', port: 6379},
        // this two filters are optional
        beforeTileRender: function(req, res, callback) {
            callback(null);
        },
        afterTileRender: function(req, res, tile, headers, callback) {
            callback(null, tile, headers);
        }
    };

// Initialize tile server on port 4000
var ws = new Windshaft.Server(config);
ws.listen(5000);
console.log("map tiles are now being served out of: http://localhost:5000"
            + config.base_url + '/:z/:x/:y.*');

// Specify .png, .png8 or .grid.json tiles.