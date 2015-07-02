var File = require('./file');
var Url  = require('./url');


var defaults = {
  urlArgs: "",
  shim: {},
  packages: [],
  paths: {},
  extensions: []
};


/**
 * @constructor
 * Provides a way to build a module meta object from a module name.  The resolution
 * relies on configuration settings, which are compatible with requirejs. The created
 * module meta objects contain information such as a url that can be used for downloading
 * the corresponding file from a remote sever.
 */
function Resolver(options) {
  options = options || {};
  var baseUrl = options.baseUrl || ".";

  // Make sure that if a baseUrl is provided, it ends in a slash.  This is to ensure
  // proper creation of URLs.
  if (baseUrl && baseUrl[baseUrl.length - 1] !== '/') {
    baseUrl = baseUrl + '/';
  }

  for (var option in defaults) {
    this[option] = options.hasOwnProperty(option) ? options[option] : defaults[option];
  }

  this.baseUrl = baseUrl;
}


/**
 * Creates a module meta from a module name/id.
 *
 * @param {string} name - Module name/id
 * @param {string} baseUrl - base url to be used when the `name` starts with `./`, `../`, or a protocol.
 *   Otherwise the configured baseUrl is used.
 *
 * @returns {{name: string, file: File, urlArgs: string, shim: object}}
 */
Resolver.prototype.resolve = function(name, baseUrl) {
  var i, length, file, fileExtension, pkg, pkgParts, pkgName, pkgPath, shim;
  var shims      = this.shim;
  var packages   = this.packages;
  var paths      = this.paths;
  var fileName   = paths[name];
  var plugins    = name.split("!");

  // The last item is the actual module name.
  name     = plugins.pop();
  pkgParts = name.replace(/[\/\\]+/g, "/").split("/");
  pkgName  = pkgParts.shift();
  pkgPath  = pkgParts.join("/");

  // Go through the packages and figure if the module is actually configured as such.
  for (i = 0, length = packages.length; i < length; i++) {
    pkg = packages[i];

    if (pkg === pkgName) {
      fileName = pkgName + "/" + "main";
      break;
    }
    else if (pkg.name === pkgName) {
      fileName = (pkg.location && (pkg.location + "/")) || "";
      fileName += pkgName + "/" + (pkgPath || (pkg.main || "main"));
      break;
    }
  }

  if (shims.hasOwnProperty(name)) {
    shim = {
      name: shims[name].exports || shims[name].name || name,
      deps: shims[name].imports || shims[name].deps || []
    };
  }

  if (!fileName) {
     fileName = name;
  }

  // Get the extension to determine if we need to add the `js` extension or not.
  fileExtension = File.getExtension(fileName);

  // Let's assume .js extension for everything that is not for a plugin
  // or a known extension
  if (plugins.length === 0 && fileExtension !== "js" && this.extensions.indexOf(fileExtension) === -1) {
    fileName += ".js";
  }

  baseUrl = Resolver.useBase(fileName) && baseUrl ? baseUrl : this.baseUrl;
  file    = new File(this.urlArgs ? fileName + "?" + this.urlArgs : fileName, baseUrl);

  return {
    name: name,
    file: file, // Deprecated in favor of `url`
    url: file.url,
    shim: shim,
    plugins: plugins
  };
};


/**
 * Checks and returns true if name starts with `./`, `../`, or a protocol.  Otherwise returns false;
 */
Resolver.useBase = function(name) {
  return (name[0] === '.' && (name[1] === '/' || (name[1] === '.' && name[2] === '/'))) || Resolver.hasProtocol(name);
};


/**
 * Quick check to determine if the name has a known protocol. Currently we only support http(s) and file.
 */
Resolver.hasProtocol = function(name) {
  return /^(?:(https?|file)(:\/\/\/?))/g.test(name);
};


Resolver.File  = File;
Resolver.Url   = Url;
module.exports = Resolver;
