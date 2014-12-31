!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.amdResolver=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function() {
  "use strict";

  function File (fileUri, baseUri) {
    var fileName, mergedPath;
    baseUri = baseUri || "";
    fileUri = File.parseUri(fileUri);

    if (fileUri.protocol || !baseUri) {
      fileName = File.parseFileName(fileUri.path);
    }
    else {
      baseUri    = File.parseUri(baseUri);
      mergedPath = File.mergePaths(fileUri.path, baseUri ? baseUri.path : "/");
      fileName   = File.parseFileName(mergedPath);
    }

    this._file    = fileUri;
    this.protocol = fileUri.protocol ? fileUri.protocol + fileUri.protocolmark : undefined;
    this.name     = fileName.name;
    this.path     = fileName.path;
  }

  File.prototype.toUrl = function (extension) {
    var file = this;
    return (file.protocol || "") + (file.path || "") + file.name + (extension || ".js");
  };

  /**
   * Parses out uri
   */
  File.parseUri = function(uriString) {
    if (!uriString) {
      throw new Error("Must provide a string to parse");
    }

    if (File.isHttpProtocol(uriString)) {
      return File.parseHttpProtocol(uriString);
    }
    else {
      return File.parseFileProtocol(uriString);
    }
  };

  /**
   * Parses out the string into file components
   * return {object} file object
   */
  File.parseFileProtocol = function (uriString) {
    var uriParts = /^(?:(file:)(\/\/\/?))?(([A-Za-z-]+:)?[/\\d\w\.\s-]+)/gmi.exec(uriString);
    uriParts.shift();

    // Make sure we sanitize the slashes
    if (uriParts[2]) {
      uriParts[2] = File.normalize(uriParts[2]);
    }

    return {
      protocol: uriParts[0],
      protocolmark: uriParts[1],
      path: uriParts[2],
      drive: uriParts[3],
      href: uriString,
      uriParts: uriParts
    };
  };

  /**
   * Parses out a string into an http url
   * @return {object} url object
   */
  File.parseHttpProtocol = function (uriString) {
    var uriParts = /^((https?:)(\/\/)([\d\w\.-]+)(?::(\d+))?)?([\/\\\w\.()-]*)?(?:([?][^#]*)?(#.*)?)*/gmi.exec(uriString);
    uriParts.shift();

    // Make sure we sanitize the slashes
    if (uriParts[5]) {
      uriParts[5] = File.normalize(uriParts[5]);
    }

    return {
      origin: uriParts[0],
      protocol: uriParts[1],
      protocolmark: uriParts[2],
      hostname: uriParts[3],
      port: uriParts[4],
      path: uriParts[5],
      search: uriParts[6],
      hash: uriParts[7],
      href: uriString,
      uriParts: uriParts
    };
  };

  /**
   * Tests if a uri has a protocol
   * @return {boolean} if the uri has a protocol
   */
  File.hasProtocol = function (path) {
    return /^(?:(https?|file)(:\/\/\/?))/g.test(path) === false;
  };

  /**
   * Test is the input constains the file protocol delimiter.
   * @return {boolean} True is it is a file protocol, othterwise false
   */
  File.isFileProtocol = function (protocolString) {
    return /^file:/gmi.test(protocolString);
  };

  /**
   * Test is the input constains the http/https protocol delimiter.
   * @return {boolean} True is it is an http protocol, othterwise false
   */
  File.isHttpProtocol = function (protocolString) {
    return /^https?:/gmi.test(protocolString);
  };

  /**
   * Build and file object with the important pieces
   */
  File.parseFileName = function (fileString) {
    var fileName;
    var pathName = fileString.replace(/([^/]+)$/gmi, function(match) {
      fileName = match;
      return "";
    });

    return {
      name: fileName,
      path: pathName
    };
  };

  /**
   * Removes all forward and back slashes to forward slashes as well as all duplicates slashes
   * and resolve all . and .. in the path.
   * @param {string} path - Path to normalize
   * @return {string} path with only one forward slash a path delimters
   */
  File.normalize = function (path) {
    var pathParts = path.replace(/[\\/]+/g, "/").split("/"),
        pathCount = pathParts.length - 1,
        skip      = 0,
        newPath   = [];

    while (pathCount >= 0) {
      if (pathCount > 0) {
        if (pathParts[pathCount] === "..") {
          pathCount -= 1; skip++; continue;
        }
        else if (pathParts[pathCount] === ".") {
          pathCount -= 1; continue;
        }
      }

      if (skip) {
        pathCount -= skip;
        skip = 0;
      }

      newPath.unshift(pathParts[pathCount]);
      pathCount--;
    }

    return newPath.join('/');
  };

  /**
   * Merges a path with a base.  This is used for handling relative paths.
   * @return {string} Merge path
   */
  File.mergePaths = function (path, base) {
    if (path[0] === '/') {
      return File.normalize(path);
    }

    if (base && path) {
      path = base + "/" + path;
    }
    else {
      path = path || base;
    }

    return File.normalize(path);
  };

  module.exports = File;
})();

},{}],2:[function(require,module,exports){
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
   * @returns {"name": {string}, "file": {File}, "urlArgs": {string}, "shim": {object}}
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

},{"./file":1}]},{},[2])(2)
});