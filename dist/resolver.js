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

  File.prototype.toUrl = function () {
    var file = this;
    return (file.protocol || "") + (file.path || "") + file.name;
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
   * Method to add an extension if one does not exist in the fileString.  It does NOT replace
   * the file extension if one already exists in `fileString`.
   *
   * @param {string} fileString - File string to add the extension to if one does not exist
   * @param {string} extension - Extension to add if one does not exist in `fileString`. The
   *   value is the extension without the `.`. E.g. `js`, `html`.  Not `.js`, `.html`.
   * @returns {string} New fileString with the new extension if one did not exist
   */
  File.addExtension = function(fileString, extension) {
    var fileName  = File.parseFileName(fileString),
        fileParts = fileName.name.split(".");

    if (fileParts.length === 1 && extension) {
      fileParts.push(extension);
    }

    return fileName.path + fileParts.join(".");
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
      file: new File(File.addExtension(fileName, "js"), settings.baseUrl),
      urlArgs: settings.urlArgs,
      shim: shim,
      plugins: plugins
    };
  };

  Resolver.File = File;
  module.exports = Resolver;
})();

},{"./file":1}]},{},[2])(2)
});