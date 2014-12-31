(function() {
  "use strict";

  var File = require('./file');

  /**
   * @constructor Resolver - provides a way to take a configuration such as one
   * from requirejs to convert module names/ids to module meta objects. Module meta
   * objects contain information such as the url for the module, which can be used
   * for retrieving the corresponding file from a remote sever.
   *
   * @param {object} settings - is a configuration object for properly creating
   *   module meta objects.  It is compatible with requirejs settings for `paths`,
   *   `packages`, `baseUrl`, `shim`, and `urlArgs`.
   *
   * @param {string} baseUrl - path every URL that is created is relative to.
   *
   * @param {object} settings.paths - is an object with key value pairs to define alias
   *   names to files.  These alias are used by the resolver to create a proper url from
   *   the name of the module.
   *   For example, if you wanted to have a module called `md5` and you wanted
   *   to map that to the location of the actual file, you can define the following:
   *
   *   ``` javascript
   *   {
   *     "paths": {
   *       "md5": "path/to/file/module"
   *     }
   *   }
   *   ```
   *
   *   That will tell the resolver the location for `md5` to create a proper url.
   *
   * @param {array} settings.packages - is an array for defining directory aliases to
   *   module files. Think npm packages that have an `index.js` or a `main.js`.
   *
   *   A package can just be a string, in which case if we gave resolver the name of the
   *   package, it will generate urls in the form of `packagename/main.js`.  That is to
   *   say that if you have a package called `machines`, then resolving that package will
   *   generate a url to `machinge/main.js`. Alternatively, a package can be an object to
   *   provide more granular control over thr url that is generated.
   *
   *   In order to configure the defaults, you can define a package as an object with the
   *   following properties:
   *
   *   @param {string} setrings.packages.location - which is the location on disk.
   *   @param {string} settings.packages.main - file name. Define if `main.js` is not what
   *     needs to be loaded.
   *   @param {string} settings.packages.name - package name.
   *
   * @param {object} settings.shim - maps code in the global object to modules. This is
   *   primarily used when code is loaded does that not support an AMD system so the
   *   code is in the global space.  An example of this is Backbone.  So, in order to
   *   consume Backbone as a module dependency, we need to know how to find it in the
   *   global object and possibly dependencies.
   *
   *   Shims provides two options
   *   @param {string} exports - The name of the code in the global object.
   *   @param {array} deps - List of dependencies.  This is important when the shim needs
   *     certain code to be loaded before the shim itself.
   *
   */
  function Resolver(options) {
    this.settings = options;
  }

  /**
   * Creates a module meta from a module name/id.
   *
   * @param {string} name - Module name/id
   *
   * @returns {"name": {string}, "file": {File}, "urlArgs": {string}, "globalName": {string}}
   */
  Resolver.prototype.resolve = function(name) {
    var i, length, pkg, shim;
    var settings = this.settings,
        shims    = settings.shim,
        packages = settings.packages,
        fileName = (settings.paths && settings.paths[name]) || name;

    // Go through the packages and figure if the module is actually configured as such.
    for (i = 0, length = packages.length; i < length; i++) {
      pkg = packages[i];
      if (pkg === name) {
        fileName = name + "/" + "main";
        break;
      }
      else if (pkg.name === name) {
        fileName = pkg.location ? (pkg.location + "/") : "";
        fileName += name + "/" + (pkg.main || "main");
        break;
      }
    }

    if (shims && shims.hasOwnProperty(name)) {
      shim = {
        name: shims[name].exports || shims[name].name || name,
        deps: shims[name].deps || []
      };
    }

    return {
      name: name,
      file: new File(fileName, settings.baseUrl),
      urlArgs: settings.urlArgs,
      shim: shim
    };
  };

  Resolver.File = File;
  module.exports = Resolver;
})();
