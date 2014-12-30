(function() {
  "use strict";

  var File = require('./file');

  function Resolve(settings) {
    this.settings = settings;
  }

  Resolve.prototype.resolve = function(name) {
    var i, length, pkg, globalName;
    var settings = this.settings,
        globals  = settings.globals || settings.shim,
        packages = settings.packages,
        fileName = "";

    // Go through the packages and figure if the module is actually configured as such.
    for (i = 0, length = packages.length; i < length; i++) {
      pkg = packages[i] || '';
      if (pkg.name === name || pkg === name) {
        if (pkg.location) {
          fileName = pkg.location + "/";
        }

        fileName += name + "/" + (pkg.main || "main");
        break;
      }
    }

    if (!fileName) {
      fileName = (settings.paths && settings.paths[name]) || name;
    }

    // Once the module has been fully resolved, we finally added to the list of available modules
    if (globals && globals.hasOwnProperty(name)) {
      globalName = globals[name].exports || name;
    }

    return {
      name: name,
      file: new File(fileName, settings.baseUrl),
      urlArgs: settings.urlArgs,
      globalName: globalName
    };
  };

  module.exports = Resolve;
})();
