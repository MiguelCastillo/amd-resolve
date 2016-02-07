/* jshint unused: false, undef: false */
var System = bitimports
  .config({
    "baseUrl": "../",
    "paths": {
      "chai": "node_modules/chai/chai"
    },
    "urlArgs": "bust=" + (new Date()).getTime()
  })
  .ignore(["dist/amd-resolver"]);

//System.logger.enableAll();
