## Docker image usage

A Tilegarden Docker image is maintained at [url goes here](url goes here).

### Environment variables
When using the Docker image make sure to define the following environment variables, either with `docker-compose`'s `env-file` field or with the `-e` or `--env-file` flags. 
 * Required:
 	* `AWS_PROFILE`, or `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`: Some references to your AWS credentials. [See here](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/setting-credentials-node.html) for more on AWS's credential specification options.
 	* `PROJECT_NAME`: The name of your deployed Tilegarden instance.
 	* `LAMBDA_REGION`: AWS region to deploy your project to.
 	* `PROD_*`: Production versions of templatable variables in your `map-config.mml` file.
 * Optional:
 	* `DEV_*`: Development versions of templatable variables in your `map-config.mml` file.
    * `LAMBDA_ROLE`: Pre-existing IAM role to apply to your lambda function.
    * `LAMBDA_TIMEOUT`: Maximum running time of your lambda function, in seconds.
    * `LAMBDA_MEMORY`: Maximum memory available to each lambda execution, in MB.
    * `LAMBDA_SUBNETS`: VPC Subnets that your lambda should use, as a comma-separated list.
    * `LAMBDA_SECURITY_GROUPS`: VPC Security Groups that your lambda should use, as a comma-separated list.
 
### Development
If integrating the Tilegarden image into a development environment, simply running the image with no other command will start a development server. The tile server is exposed on port `3000`, while the Node debugger is exposed on port `9229`.

### Built-in commands
Commands can be run with `docker run IMAGE [COMMAND]` or equivalent.
#### `deploy [--new]`
Deploys a new instance (with `--new`) of Tilegarden to AWS, using the specified credentials. Without `--new`, updates an existing Tilegarden deployment. To include map configuration files in your AWS deployment, mount the directory containing your configuration files on to the image's `/home/tiler/config` directory.
#### `destroy`
Removes a previously deployed instance of Tilegarden from AWS.
#### `build-xml [-b|-d|-e|-h]`
Compiles a directory of `.mml` + `.mss` files into a directory of Tilegarden-readable `.xml` files. The default in- and output directories are used internally by the image but can be overridden by mounting volumes on to those directories using `-v`.
 * Overridable input directory: `/home/tiler/config`
 * Overridable output directory: `/home/tiler/bin/config`

Options:
 * `-b | --s3_bucket`: Uploads `.xml` files to the specified S3 bucket rather than saving them to disk.
 * `-d | --development`: Template files with development variables rather than production ones.
