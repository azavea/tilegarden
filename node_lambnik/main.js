/**
 * Lambda framework entrypoint
 */

 exports.handler = function (event, context) {
     'use strict';
     console.log(event);
     context.succeed(`hello ${event.name}`);
 }
