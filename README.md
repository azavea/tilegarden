# :world_map: tilegarden :sunflower: [![Build Status](https://travis-ci.org/azavea/tilegarden.svg?branch=develop)](https://travis-ci.org/azavea/tilegarden)

## Usage
### Local Development
Dependencies: docker, docker-compose
 * Clone the Tilegarden repository to your machine.
 * Configure your data set for development:
   * Add your geospatial data to the `data/` directory. .zipped shapefiles and gzipped sql dumps will be loaded in to the development database automatically.
   * Make sure the name of the file matches the name of the sql table that contains the data.
 * Configure your map:
   * Open the file `src/tiler/src/config/map-config.mml`. This is where you specify your map settings. A full specification for Carto’s .mml format can be found here: https://cartocss.readthedocs.io/en/latest/mml.html
   * Of particular note is the “Layer” property, which specifies the layers of your map (as an array). Odds are you won’t have to change the target srs (at the top of the file), but make sure that the srs of each layer is specified properly.
 * Create a copy of `env-template` named `.env`. This contains production-specific configuration options and doesn’t need to be filled out right now (but must exist in order to run the development server).
 * Run `./scripts/update` to create your Docker containers and populate the development database. The optional flag `--download` will download the data sets used for our demos.
 * Run `./scripts/server` to start the development server. It will be available at localhost:9001 (not 3000!), your tiles can be found at `/tile/{z}/{x}/{y}.png`.
 * The local development server exposes a node.js debugger, which can be attached to by Chrome DevTools or your IDE of choice [(see below)](#Debugging).
 * The local development environment can be reset by running `./scripts/clean`, which removes all development artifacts including Docker containers and volumes.

#### Map Styles
Map styles are specified in CartoCSS, the specification for which can be found here: https://cartocss.readthedocs.io/en/latest/. The default stylesheet is located at `src/tiler/src/config/style.mss`. Multiple stylesheets can be used by adding them to the parameter “Stylesheet” in `src/tiler/src/config/map-config.mml`. Each .mss “class” refers to a map layer (its “id” property), specified in `map-config.mml`. 

#### Filters
Filters are specified by altering the query of one of your map’s layers in `src/tiler/src/config/style.mss`, and can then be fetched through the API. To create a filtered layer, modify the “table” property of the layer to have the format `(QUERY) as VARIABLE`. 
   * Make sure each layer has unique “id” and “name” values.
   * Make sure to include the geom column in this query, along with whatever columns you are filtering by.
   * *Example:* `(SELECT geom,homes FROM table_name WHERE homes=’big’ ) as q` would create a filtered layer for all points that have a “homes” value of “big” in your database.
   
Layers can be accessed from the API by adding `?layers=layer1,layer2,etc.` as a query string to a tile or UTF grid URL. If no layers are specified in the query string, all layers specified in`map-config.mml` are displayed simultaneously.


#### UTF Grids
UTF grids can be generated at the url `/grid/{z}/{x}/{y}?utfFields=field1,field2,etc.`, where “utfFields” is a comma-separated list of one or more table columns from the database. Each grid url MUST have a “utfFields” query string. If you have already modified the table query of a layer to specify a filter, be sure the include the utf field column in the query. *Ex.* `(SELECT geom,homes,dog... )` if you want to base a UTF grid off the value of “dog”.

#### Vector Tiles
Vector tiles of your data can be generated at the endpoint `/vector/{z}/{x}/{y}`. Filtering by layer works via query string but can also be handled client side, as can styling.

#### Debugging
The local development server exposes a websocket to a node inspector that can be attached to your IDE of choice to step through and debug your code. Here are instructions on how to do so using Google Chrome's Dev Tools:
 * Start the development server with `./scripts/server`.
 * Open Google Chrome and navigate to `about:inspect`.
 * There should be an option listed as something along the lines of "Target (v8.10.0)" with the Node.js logo and a path like `file:///home/tiler/bin`. Click "inspect", underneath.
 * A new window will open up. Type `ctrl+p` to open a search bar that lets you navigate to your source code. _The transpiled code in `src/tiler/bin/` is what is actually being tracked by the debugger,_  not the source code in `src/tiler/src/`.

### Deployment to AWS
 * Specify your production credentials and lambda function settings in `.env`. The requiring variables are required:
   * `AWS_PROFILE`: the name of the AWS user profile you want to deploy your project as. You may have this set already in your environment, otherwise you’ll want to set it to one of the names of the sets of credentials specified in `~/.aws/credentials`. Defaults to “default”.
   * `PROJECT_NAME`: the name of your project. This must be unique among the functions you currently have deployed to AWS Lambda.
   * `PROD_TILEGARDEN_*`: the credentials necessary to connect to your production database.
   * `LAMBDA_REGION`: the AWS region to which you want your lambda functions deployed.
   * `LAMBDA_ROLE`: the name/ARN of the IAM role to give your lambda. Leave this blank to have one created for you automatically.
   * `LAMBDA_SUBNETS` and `LAMBDA_SECURITY_GROUPS`: only required if you need to connect to other AWS resources (such as an RDS instance), in which case these should match the values that those resources have.
   * [See below for more options](#Additional-Configuration-Options)
 * [See below to make sure your AWS profile has the requisite permissions for automated deployment.](#Required-AWS-Permissions)
 * Run `./scripts/publish --new`. This will:
   1. Create a new AWS Lambda function with your specified settings
   2. Create an API Gateway from which to serve your content
   3. Create a CloudFront distribution to act as a proxy to circumvent certain API Gateway limitations.
 * Updates to an existing project can be deployed by running `./scripts/publish` (no “--new”).
 * All deployed resources can be removed by running `./scripts/destroy`.

#### Additional Configuration Options
 * `USER`: Left unspecified so that the code knows who the local user is from inside docker containers. Gets tacked on to the end of the project name at deployment.
 * `LAMBDA_TIMEOUT`: Time (in seconds) before your lambda function times out (maximum 300).
 * `LAMBDA_MEMORY`: Amount of memory (in MB) to allocate per function. Must be a multiple of 64, minimum 128, maximum 3008.

#### Required AWS Permissions
For automated deployment, the AWS profile you are deploying as has to have at least the following permissions:
 * CloudFrontFullAccess
 * AmazonAPIGatewayAdministrator
 * AWSLambdaFullAccess
 * If you don’t specify a pre-existing execution role, at least the following IAM permissions
   * iam:DeleteRolePolicy
   * iam:DeleteRole
   * iam:CreateRole
   * iam:AttachRolePolicy
   * iam:PutrolePolicy
 * Your lambda functions will have whichever permissions the profile used to create them has, so keep this in mind if certain policies are required to access your data store.
