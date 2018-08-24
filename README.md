# tilegarden :world_map::sunflower: [![Build Status](https://travis-ci.org/azavea/tilegarden.svg?branch=develop)](https://travis-ci.org/azavea/tilegarden)

## Contents
 * [About](#About)
 * [Usage](#Usage)
   * [Local Development](#local-development)
     * [Configuration Selection and Storage](#configuration-selection-and-storage)
     * [Map Styles](#map-styles)
     * [Filters](#filters)
     * [UTF Grids](#utf-grids)
     * [Vector Tiles](#vector-tiles)
     * [Debugging](#debugging)
   * [Deployment to AWS](#deployment-to-aws)
     * [Additional Configuration Options](#additional-configuration-options)
     * [Required AWS Permissions](#required-aws-permissions)
 * [Helpful Links](#helpful-links)

## About
Tilegarden is a serverless tile-rendering tool using [Mapnik](http://mapnik.org/), built for AWS Lambda. Serve custom-generated map tiles without having to worry about server maintenance, scaling, or paying for resources that aren't being accessed.

## Usage
### Local Development
Dependencies: docker, docker-compose
 * Clone the Tilegarden repository to your machine.
 * Add any development data:
   * Add your geospatial data to the `data/` directory. .zipped shapefiles and gzipped SQL dumps will be loaded in to the development database automatically.
   * Make sure the name of the file matches the name of the SQL table that contains the data.
 * Configure your map:
   * Open the file [`src/tiler/src/config/map-config.mml`](src/tiler/src/config/map-config.mml). This is where you specify your map settings. [A full specification for Carto's .mml format can be found here.](https://cartocss.readthedocs.io/en/latest/mml.html)
   * Of particular note is the “Layer” property, which specifies the layers of your map (as an array). Odds are you won't have to change the target srs (at the top of the file), but make sure that the srs of each layer is specified properly. By default, all layers of your map are displayed at once, but different combinations of layers can be selected using the `layers` query string. See [Filters](#filters) for more info.
 * Create a copy of [`env-template`](.env.template) named `.env`. This contains production-specific configuration options and doesn't need to be filled out right now (but must exist in order to run the development server).
 * Run `./scripts/update` to create your Docker containers and populate the development database. The optional flag `--download` will download the data sets used for our demos.
 * Run `./scripts/server` to start the development server. It will be available at [localhost:3000](http://localhost:3000/), your tiles can be found at `/tile/{z}/{x}/{y}.png`.
 * The local development server exposes a node.js debugger, which can be attached to by Chrome DevTools or your IDE of choice [(see below)](#Debugging).
   * (Optional) If you downloaded the example data using `./scripts/update --download`, opening [`index.html`](index.html) (or any of the pages in [`demo/`](demo/)) should show you working demos.
 * The local development environment can be reset by running `./scripts/clean`, which removes all development artifacts including Docker containers and volumes.
 
#### Configuration Selection and Storage
Multiple map configuration `.mml` files can be included in your project's [`src/tiler/src/config`](src/tiler/src/config) to be dynamically loaded at run-time. Use the query string `config` with the name of your configuration file (without the file extension) to select which file gets loaded when rendering tiles. If no `config` is provided, Tilegarden tries to load the config file named `map-config`. 
 * _Example_: if you have a configuration file named `my-good-map.mml`, you can tell Tilegarden to use it with the endpoint `/tile/{z}/{x}/{y}.png?config=my-good-map`
 
 Configuration files can also be optionally loaded from an AWS S3 bucket, which allows you to add/remove/replace available maps without having to redeploy your entire project. To do so, add `&s3bucket=<bucket-name>` to your query string, and treat the `config` parameter as the desired config file's key. You can use the `build-xml` script to generate config files for this purpose without having to spin up the entire development environment, run `./scripts/build-xml --help` for more info.
  * Accessing config files stored in S3 requires you to have deployed your Tilegarden instance using an AWS profile with read/write permissions for the desired S3 bucket. These permissions are passed on to the AWS Lambda function. **You must also manually add the `AmazonS3ReadOnlyAccess` permission to the IAM role** that gets created for your lambda, or otherwise use a custom role that has that permission, since `claudia` doesn't add it during creation.
  * `build-xml` has a `-b/--s3_bucket <name>` flag which automatically uploads built files to S3 instead of saving them to disk. This requires you to have the AWS CLI installed on your machine, and uses the AWS credentials you've specified in `.env`.
 
#### Datasources
Tilegarden supports the use of any geospatial data source that Mapnik/Carto does (shapefile, postgis, pgraster, raster). However, bear in mind that only PostGIS data sources support custom queries, and are thus the only ones that allow you to perform additional filtering on your data (see [Filters](#filters)). Also, attempting to bundle large local data files into your Tilegarden deployment could lead to rejection by AWS Lambda due to size restrictions.

#### Map Styles
Map styles are specified in CartoCSS, [the specification for which can be found here.](https://cartocss.readthedocs.io/en/latest/) The default stylesheet is located at [`src/tiler/src/config/style.mss`](src/tiler/src/config/style.mss). Multiple stylesheets can be used by adding them to the parameter “Stylesheet” in [`src/tiler/src/config/map-config.mml`](src/tiler/src/config/map-config.mml). Each .mss “class” refers to a map layer (its “id” property), specified in `map-config.mml`. 

#### Filters
Filtering your geospatial data can be done in two ways:
##### Custom Layer Queries
Filters can be specified on the back-end by altering the query of one of your map's layers in [`src/tiler/src/config/map-config.mml`](src/tiler/src/config/map-config.mml), and can then be fetched through the API. To create a filtered layer, modify the “table” property of the layer to have the format `(QUERY) as VARIABLE`. 
   * Make sure each layer has a unique “id” value.
   * Make sure to include the geometry column in this query, along with whatever columns you are filtering by.
   * *Example:* `(SELECT geom,homes FROM table_name WHERE homes='big') as q` would create a filtered layer for all points that have a “homes” value of “big” in your database.
   
Layers can be accessed from the API by adding `?layers=["layer1","layer2",etc.]` (a valid JSON array)as a query string to a tile or UTF grid URL. If no layers are specified in the query string, all layers specified in `map-config.mml` are displayed simultaneously.

##### Client-specified Filtering
Layers can also be filtered dynamically by passing a JSON object as a value of a layer in the `?layers` array. The schema for this sort of request looks like the following:
```
[
    {
        "name":"layer1",
        "mode": "AND" // optional, operator to use to combine filters, can either be AND or OR, defaults to AND
        "filters": [ // optional, applies no filters if missing
            {
                "col":"column1", // table column you wish to filter by
                "val":"value1", // value to filter on
                "op": ">" // optional, boolean operator to use when comparing col to val, = by default
            }
        ]
    }
]
```
The resulting url would have the query string `?layers=[{"name":"layer1","filters":[{"col":"column1","val":"value1","like": true}]}]`. Filtering layers in this way appends `WHERE col='val'` to the existing query defined for the layer. Defining multiple filters in the "filters" array of the layer object `AND`s the filters together in the query.
 * **NOTE:** Be careful with `%`s in your JSON! Browsers/Tilegarden automatically handle most percent-encodable characters, but `%`s especially can cause your JSON to become unparsable. Call `encodeURIComponent()` on your filter objects for safety.

#### UTF Grids
UTF grids can be generated at the url `/grid/{z}/{x}/{y}?utfFields=field1,field2,etc.`, where “utfFields” is a comma-separated list of one or more table columns from the database. Each grid url MUST have a “utfFields” query string. If you have already modified the table query of a layer to specify a filter, be sure the include the utf field column in the query. *Ex.* `(SELECT geom,homes,dog... )`, if you want to base a UTF grid off the value of “dog”.

#### Vector Tiles
Vector tiles of your data can be generated at the endpoint `/vector/{z}/{x}/{y}`. Filtering by layer works via query string but can also be handled client side, as can styling. [See here for more info about the Mapbox Vector Tile specification.](https://www.mapbox.com/vector-tiles/)

#### Debugging
The local development server exposes a Node.js process WebSocket that can be attached to your IDE of choice to step through and debug your code. Here are instructions on how to do so using Google Chrome's Dev Tools:
 * Start the development server with `./scripts/server`.
 * Open Google Chrome and navigate to `about:inspect`.
 * There should be an option listed as something along the lines of "Target (v8.10.0)" with the Node.js logo and a path like `file:///home/tiler/bin`. Click "inspect", underneath.
 * A new window will open up. Enter `ctrl+p` to open a search bar that lets you navigate to your source code. _The transpiled code in `src/tiler/bin/` is what is actually being tracked by the debugger,_  not the source code in `src/tiler/src/`.

### Deployment to AWS
A deployed instance of Tilegarden consists of several AWS resources:
 1. An AWS Lambda function which handles the tiling logic.
 2. An API Gateway API that acts as an endpoint and routes HTTP requests to the lambda function.
 3. A CloudFront distribution that acts as a proxy in order to circumvent some issues that API Gateway has serving image content.
 
 * Specify your map in a map configuration file and place it in [`src/tiler/src/config/`](src/tiler/src/config/) (where you can find pre-existing examples). [A full specification for Carto's .mml format can be found here.](https://cartocss.readthedocs.io/en/latest/mml.html)
 * Specify your production credentials and lambda function settings in `.env`. The following variables are required:
   * `AWS_PROFILE`: the name of the AWS user profile you want to deploy your project as. You may have this set already in your environment, otherwise you'll want to set it to one of the names of the sets of credentials specified in `~/.aws/credentials`. Defaults to “default”.
   * `PROJECT_NAME`: the name of your project. This must be unique among the functions you currently have deployed to AWS Lambda.
   * `PROD_TILEGARDEN_*`: the credentials necessary to connect to your production database.
   * `LAMBDA_REGION`: the AWS region to which you want your lambda functions deployed.
   * `LAMBDA_ROLE`: the name/ARN of the IAM role to give your lambda. Leave this blank to have one created for you automatically.
   * `LAMBDA_SUBNETS` and `LAMBDA_SECURITY_GROUPS`: only required if you need to connect to other AWS resources (such as an RDS instance), in which case these should match the values that those resources have.
   * [See below for more options.](#Additional-Configuration-Options)
 * [See below to make sure your AWS profile has the requisite permissions for automated deployment.](#Required-AWS-Permissions)
 * Run `./scripts/deploy --new` to create new instances of the necessary AWS resources.
   * Updates to an existing project can be deployed by running `./scripts/deploy` (no “--new”). Note that only certain function settings (`LAMBDA_TIMEOUT` and `LAMBDA_MEMORY`) are updated by this command, changes to IAM Role/subnets/security groups/etc. must be made manually on the AWS dashboard.
 * All deployed resources can be removed by running `./scripts/destroy`.

#### Additional Configuration Options
 * `USER`: Left unspecified so that the code knows who the local user is from inside docker containers. Gets tacked on to the end of the project name at deployment.
 * `LAMBDA_TIMEOUT`: Time (in seconds) before your lambda function is automatically cancelled (maximum 300). You'll probably need to modify this value as tile rendering can take longer than AWS's default timeout, depending on the complexity of the data you're rendering.
 * `LAMBDA_MEMORY`: Amount of memory (in MB) to allocate per function. Must be a multiple of 64, minimum 128, maximum 3008. As with `LAMBDA_TIMEOUT`, more complex data requires more allocated memory, but 128MB should be enough in most scenarios.

#### Required AWS Permissions
The AWS profile used for deployment must have at least the following policies and permissions:
 * `CloudFrontFullAccess`
 * `AmazonAPIGatewayAdministrator`
 * `AWSLambdaFullAccess`
 * If you don't specify a pre-existing execution role, at least the following IAM permissions
   * `iam:DeleteRolePolicy`
   * `iam:DeleteRole`
   * `iam:CreateRole`
   * `iam:AttachRolePolicy`
   * `iam:PutRolePolicy`
 * Your lambda functions will have whichever permissions the profile used to create them has, so keep this in mind if certain policies are required to access your data store.

## Helpful Links
  * [CartoCSS Documentation](https://cartocss.readthedocs.io/en/latest/index.html)
  * [CartoCSS Styling Guide](https://carto.com/docs/carto-engine/cartocss/)
  * [Mapbox Vector Tile Documentation](https://www.mapbox.com/vector-tiles/)
