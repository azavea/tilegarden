# tilegarden

### Usage
 * Make sure to have `docker`, `docker-compose`, and `yarn` installed locally.
 * After a clone, run `./scripts/update` to populate the database and install node modules.
 * Run `./scripts/server` to run the development server, which will be accessible on port **9001**, not 3000 as listed by the output from claudia-local-api. Several example endpoints have been defined in `src/api.js`.
 * To publish, make sure you have specified valid AWS credentials and have listed the proper database credentials in a `.env` file in the root of the project. The format for this file can be copied from `env-template`. You can then run `./scripts/publish` to publish to AWS Lambda.

### Notes
Serving image files from a local directory is currently not functional due to HTTP header issues. 
