# tilegarden

## Usage
 * Make sure to have `docker`, `docker-compose`, and `yarn` installed locally.
 * After a clone, run `./scripts/update` to populate the database and install node modules.
 * Run `./scripts/server` to run the development server, which will be accessible on port **9001**, not 3000 as listed by the output from claudia-local-api. Several example endpoints have been defined in `src/api.js`.
 	* Display usage info: `/`
 	* Generate a map tile: `/tile/{z}/{x}/{y}.png` serves tiles.
 	* Generate a UTF grid: `/grid/{z}/{x}/{y}`
 * To publish, make sure you have specified valid AWS credentials and have listed the proper database credentials in a `.env` file in the root of the project. The format for this file can be copied from `env-template`. You can then run `./scripts/publish --new` to publish to AWS Lambda.
   * For subsequent deployments of the same lambdas, leave off the `--new` tag.
   * **NOTE:** Only `LAMBDA_TIMEOUT` and `LAMBDA_MEMORY` are changed on "update" deployments, all other settings must be changed by logging in to the Lambda Management Console or by deploying a new project.
 * API Gateway has trouble serving images, so you need to configure some sort of proxy (e.g. using a CloudFront distribution) that sets an `Accept:image/png` header on all lambda requests.
 
### Configuration & Styling
[Tilegarden uses CartoCSS to specify map styles.](https://carto.com/docs/carto-engine/cartocss/) Edit `src/tiler/src/config/map-config.mml` to specify your map configuration, including a reference any CartoCSS `.mss` files. [See here](https://cartocss.readthedocs.io/en/latest/mml.html) for Carto's `.mml` specification.

### Debugging
 The local development server exposes a websocket to a node inspector that can be attached to your IDE of choice to step through and debug your code. Here are instructions on how to do so using Google Chrome's Dev Tools:
  * Start the development server with `./scripts/server`.
  * Open Google Chrome and navigate to `about:inspect`.
  * There should be an option listed as something along the lines of "Target (v8.10.0)" with the Node.js logo and a path like `file:///home/tiler/node_modules/claudia-local-api/bin/claudia-local-api`. Click "inspect", underneath.
 * A new window will open up. Type `ctrl+p` to open a search bar that lets you navigate to your source code. **The transpiled code in `tiler/bin/` is what is actually being tracked by the debugger,**  not the source code in `tiler/src/`.
