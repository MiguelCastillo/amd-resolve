(function() {
  "use strict";

  var File = require('./file');

  /**
   * @constructor Resolver - provides a way to take a configuration such as one
   * from requirejs to convert module names/ids to module meta objects. Module meta
   * objects contain information such as the url for the module, which can be used
   * for retrieving the corresponding file from a remote sever.
   */
  function Resolver(options) {
    this.settings = options || {};
  }

  /**
   * Creates a module meta from a module name/id.
   *
   * @param {string} name - Module name/id
   *
   * @returns {{name: string, file: File, urlArgs: string, shim: object}}
   */
  Resolver.prototype.resolve = function(name) {
    var i, length, pkg, pkgParts, pkgName, pkgTarget, shim;
    var settings = this.settings,
        shims    = settings.shim || {},
        packages = settings.packages || [],
        fileName = (settings.paths && settings.paths[name]) || name,
        plugins  = name.split("!");

    // The last item is the actual module name.
    name      = plugins.pop();
    pkgParts  = name.replace(/[\/\\]+/g, "/").split("/");
    pkgName   = pkgParts.shift();
    pkgTarget = pkgParts.join("/");

    // Go through the packages and figure if the module is actually configured as such.
    for (i = 0, length = packages.length; i < length; i++) {
      pkg = packages[i];

      if (pkg === pkgName) {
        fileName = pkgName + "/" + "main";
        break;
      }
      else if (pkg.name === pkgName) {
        fileName = pkg.location ? (pkg.location + "/") : "";
        fileName += pkgName + "/" + (pkgTarget || (pkg.main || "main"));
        break;
      }
    }

    if (shims.hasOwnProperty(name)) {
      shim = {
        name: shims[name].exports || shims[name].name || name,
        deps: shims[name].imports || shims[name].deps || []
      };
    }

    return {
      name: name,
      deps: [],
      file: new File(File.addExtension(fileName, "js"), settings.baseUrl),
      urlArgs: settings.urlArgs,
      shim: shim,
      plugins: plugins
    };
  };

  Resolver.File = File;
  module.exports = Resolver;
})();
