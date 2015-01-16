!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.amdResolver=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"./file":2}],2:[function(require,module,exports){
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
      name: fileName || "",
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
   * Method to replace an extension, if one does not exist in the file string, it will be added.
   *
   * @param {string} fileString - File string to add the extension to if one does not exist
   * @param {string} extension - Extension to be either added to `fileString` or to replace the extension in `fileString`. The
   *   value is the extension without the `.`. E.g. `js`, `html`.  Not `.js`, `.html`.
   * @returns {string} fileString with the new extension
   */
  File.replaceExtension = function(fileString, extension) {
    var regex = /([^.\/\\]+\.)[^.]+$/;
    if (fileString.match(regex)) {
      return fileString.replace(regex, "$1" + extension);
    }
    else {
      return fileString + "." + extension;
    }
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

},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvcmVzb2x2ZXIuanMiLCJzcmMvZmlsZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIihmdW5jdGlvbigpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgdmFyIEZpbGUgPSByZXF1aXJlKCcuL2ZpbGUnKTtcblxuICAvKipcbiAgICogQGNvbnN0cnVjdG9yIFJlc29sdmVyIC0gcHJvdmlkZXMgYSB3YXkgdG8gdGFrZSBhIGNvbmZpZ3VyYXRpb24gc3VjaCBhcyBvbmVcbiAgICogZnJvbSByZXF1aXJlanMgdG8gY29udmVydCBtb2R1bGUgbmFtZXMvaWRzIHRvIG1vZHVsZSBtZXRhIG9iamVjdHMuIE1vZHVsZSBtZXRhXG4gICAqIG9iamVjdHMgY29udGFpbiBpbmZvcm1hdGlvbiBzdWNoIGFzIHRoZSB1cmwgZm9yIHRoZSBtb2R1bGUsIHdoaWNoIGNhbiBiZSB1c2VkXG4gICAqIGZvciByZXRyaWV2aW5nIHRoZSBjb3JyZXNwb25kaW5nIGZpbGUgZnJvbSBhIHJlbW90ZSBzZXZlci5cbiAgICovXG4gIGZ1bmN0aW9uIFJlc29sdmVyKG9wdGlvbnMpIHtcbiAgICB0aGlzLnNldHRpbmdzID0gb3B0aW9ucyB8fCB7fTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbW9kdWxlIG1ldGEgZnJvbSBhIG1vZHVsZSBuYW1lL2lkLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIE1vZHVsZSBuYW1lL2lkXG4gICAqXG4gICAqIEByZXR1cm5zIHt7bmFtZTogc3RyaW5nLCBmaWxlOiBGaWxlLCB1cmxBcmdzOiBzdHJpbmcsIHNoaW06IG9iamVjdH19XG4gICAqL1xuICBSZXNvbHZlci5wcm90b3R5cGUucmVzb2x2ZSA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgaSwgbGVuZ3RoLCBwa2csIHBrZ1BhcnRzLCBwa2dOYW1lLCBwa2dUYXJnZXQsIHNoaW07XG4gICAgdmFyIHNldHRpbmdzID0gdGhpcy5zZXR0aW5ncyxcbiAgICAgICAgc2hpbXMgICAgPSBzZXR0aW5ncy5zaGltIHx8IHt9LFxuICAgICAgICBwYWNrYWdlcyA9IHNldHRpbmdzLnBhY2thZ2VzIHx8IFtdLFxuICAgICAgICBmaWxlTmFtZSA9IChzZXR0aW5ncy5wYXRocyAmJiBzZXR0aW5ncy5wYXRoc1tuYW1lXSkgfHwgbmFtZSxcbiAgICAgICAgcGx1Z2lucyAgPSBuYW1lLnNwbGl0KFwiIVwiKTtcblxuICAgIC8vIFRoZSBsYXN0IGl0ZW0gaXMgdGhlIGFjdHVhbCBtb2R1bGUgbmFtZS5cbiAgICBuYW1lICAgICAgPSBwbHVnaW5zLnBvcCgpO1xuICAgIHBrZ1BhcnRzICA9IG5hbWUucmVwbGFjZSgvW1xcL1xcXFxdKy9nLCBcIi9cIikuc3BsaXQoXCIvXCIpO1xuICAgIHBrZ05hbWUgICA9IHBrZ1BhcnRzLnNoaWZ0KCk7XG4gICAgcGtnVGFyZ2V0ID0gcGtnUGFydHMuam9pbihcIi9cIik7XG5cbiAgICAvLyBHbyB0aHJvdWdoIHRoZSBwYWNrYWdlcyBhbmQgZmlndXJlIGlmIHRoZSBtb2R1bGUgaXMgYWN0dWFsbHkgY29uZmlndXJlZCBhcyBzdWNoLlxuICAgIGZvciAoaSA9IDAsIGxlbmd0aCA9IHBhY2thZ2VzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBwa2cgPSBwYWNrYWdlc1tpXTtcblxuICAgICAgaWYgKHBrZyA9PT0gcGtnTmFtZSkge1xuICAgICAgICBmaWxlTmFtZSA9IHBrZ05hbWUgKyBcIi9cIiArIFwibWFpblwiO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKHBrZy5uYW1lID09PSBwa2dOYW1lKSB7XG4gICAgICAgIGZpbGVOYW1lID0gcGtnLmxvY2F0aW9uID8gKHBrZy5sb2NhdGlvbiArIFwiL1wiKSA6IFwiXCI7XG4gICAgICAgIGZpbGVOYW1lICs9IHBrZ05hbWUgKyBcIi9cIiArIChwa2dUYXJnZXQgfHwgKHBrZy5tYWluIHx8IFwibWFpblwiKSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzaGltcy5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgc2hpbSA9IHtcbiAgICAgICAgbmFtZTogc2hpbXNbbmFtZV0uZXhwb3J0cyB8fCBzaGltc1tuYW1lXS5uYW1lIHx8IG5hbWUsXG4gICAgICAgIGRlcHM6IHNoaW1zW25hbWVdLmltcG9ydHMgfHwgc2hpbXNbbmFtZV0uZGVwcyB8fCBbXVxuICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogbmFtZSxcbiAgICAgIGRlcHM6IFtdLFxuICAgICAgZmlsZTogbmV3IEZpbGUoRmlsZS5hZGRFeHRlbnNpb24oZmlsZU5hbWUsIFwianNcIiksIHNldHRpbmdzLmJhc2VVcmwpLFxuICAgICAgdXJsQXJnczogc2V0dGluZ3MudXJsQXJncyxcbiAgICAgIHNoaW06IHNoaW0sXG4gICAgICBwbHVnaW5zOiBwbHVnaW5zXG4gICAgfTtcbiAgfTtcblxuICBSZXNvbHZlci5GaWxlID0gRmlsZTtcbiAgbW9kdWxlLmV4cG9ydHMgPSBSZXNvbHZlcjtcbn0pKCk7XG4iLCIoZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIGZ1bmN0aW9uIEZpbGUgKGZpbGVVcmksIGJhc2VVcmkpIHtcbiAgICB2YXIgZmlsZU5hbWUsIG1lcmdlZFBhdGg7XG4gICAgYmFzZVVyaSA9IGJhc2VVcmkgfHwgXCJcIjtcbiAgICBmaWxlVXJpID0gRmlsZS5wYXJzZVVyaShmaWxlVXJpKTtcblxuICAgIGlmIChmaWxlVXJpLnByb3RvY29sIHx8ICFiYXNlVXJpKSB7XG4gICAgICBmaWxlTmFtZSA9IEZpbGUucGFyc2VGaWxlTmFtZShmaWxlVXJpLnBhdGgpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGJhc2VVcmkgICAgPSBGaWxlLnBhcnNlVXJpKGJhc2VVcmkpO1xuICAgICAgbWVyZ2VkUGF0aCA9IEZpbGUubWVyZ2VQYXRocyhmaWxlVXJpLnBhdGgsIGJhc2VVcmkgPyBiYXNlVXJpLnBhdGggOiBcIi9cIik7XG4gICAgICBmaWxlTmFtZSAgID0gRmlsZS5wYXJzZUZpbGVOYW1lKG1lcmdlZFBhdGgpO1xuICAgIH1cblxuICAgIHRoaXMuX2ZpbGUgICAgPSBmaWxlVXJpO1xuICAgIHRoaXMucHJvdG9jb2wgPSBmaWxlVXJpLnByb3RvY29sID8gZmlsZVVyaS5wcm90b2NvbCArIGZpbGVVcmkucHJvdG9jb2xtYXJrIDogdW5kZWZpbmVkO1xuICAgIHRoaXMubmFtZSAgICAgPSBmaWxlTmFtZS5uYW1lO1xuICAgIHRoaXMucGF0aCAgICAgPSBmaWxlTmFtZS5wYXRoO1xuICB9XG5cbiAgRmlsZS5wcm90b3R5cGUudG9VcmwgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGZpbGUgPSB0aGlzO1xuICAgIHJldHVybiAoZmlsZS5wcm90b2NvbCB8fCBcIlwiKSArIChmaWxlLnBhdGggfHwgXCJcIikgKyBmaWxlLm5hbWU7XG4gIH07XG5cbiAgLyoqXG4gICAqIFBhcnNlcyBvdXQgdXJpXG4gICAqL1xuICBGaWxlLnBhcnNlVXJpID0gZnVuY3Rpb24odXJpU3RyaW5nKSB7XG4gICAgaWYgKCF1cmlTdHJpbmcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIk11c3QgcHJvdmlkZSBhIHN0cmluZyB0byBwYXJzZVwiKTtcbiAgICB9XG5cbiAgICBpZiAoRmlsZS5pc0h0dHBQcm90b2NvbCh1cmlTdHJpbmcpKSB7XG4gICAgICByZXR1cm4gRmlsZS5wYXJzZUh0dHBQcm90b2NvbCh1cmlTdHJpbmcpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHJldHVybiBGaWxlLnBhcnNlRmlsZVByb3RvY29sKHVyaVN0cmluZyk7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBQYXJzZXMgb3V0IHRoZSBzdHJpbmcgaW50byBmaWxlIGNvbXBvbmVudHNcbiAgICogcmV0dXJuIHtvYmplY3R9IGZpbGUgb2JqZWN0XG4gICAqL1xuICBGaWxlLnBhcnNlRmlsZVByb3RvY29sID0gZnVuY3Rpb24gKHVyaVN0cmluZykge1xuICAgIHZhciB1cmlQYXJ0cyA9IC9eKD86KGZpbGU6KShcXC9cXC9cXC8/KSk/KChbQS1aYS16LV0rOik/Wy9cXFxcZFxcd1xcLlxccy1dKykvZ21pLmV4ZWModXJpU3RyaW5nKTtcbiAgICB1cmlQYXJ0cy5zaGlmdCgpO1xuXG4gICAgLy8gTWFrZSBzdXJlIHdlIHNhbml0aXplIHRoZSBzbGFzaGVzXG4gICAgaWYgKHVyaVBhcnRzWzJdKSB7XG4gICAgICB1cmlQYXJ0c1syXSA9IEZpbGUubm9ybWFsaXplKHVyaVBhcnRzWzJdKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgcHJvdG9jb2w6IHVyaVBhcnRzWzBdLFxuICAgICAgcHJvdG9jb2xtYXJrOiB1cmlQYXJ0c1sxXSxcbiAgICAgIHBhdGg6IHVyaVBhcnRzWzJdLFxuICAgICAgZHJpdmU6IHVyaVBhcnRzWzNdLFxuICAgICAgaHJlZjogdXJpU3RyaW5nLFxuICAgICAgdXJpUGFydHM6IHVyaVBhcnRzXG4gICAgfTtcbiAgfTtcblxuICAvKipcbiAgICogUGFyc2VzIG91dCBhIHN0cmluZyBpbnRvIGFuIGh0dHAgdXJsXG4gICAqIEByZXR1cm4ge29iamVjdH0gdXJsIG9iamVjdFxuICAgKi9cbiAgRmlsZS5wYXJzZUh0dHBQcm90b2NvbCA9IGZ1bmN0aW9uICh1cmlTdHJpbmcpIHtcbiAgICB2YXIgdXJpUGFydHMgPSAvXigoaHR0cHM/OikoXFwvXFwvKShbXFxkXFx3XFwuLV0rKSg/OjooXFxkKykpPyk/KFtcXC9cXFxcXFx3XFwuKCktXSopPyg/OihbP11bXiNdKik/KCMuKik/KSovZ21pLmV4ZWModXJpU3RyaW5nKTtcbiAgICB1cmlQYXJ0cy5zaGlmdCgpO1xuXG4gICAgLy8gTWFrZSBzdXJlIHdlIHNhbml0aXplIHRoZSBzbGFzaGVzXG4gICAgaWYgKHVyaVBhcnRzWzVdKSB7XG4gICAgICB1cmlQYXJ0c1s1XSA9IEZpbGUubm9ybWFsaXplKHVyaVBhcnRzWzVdKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgb3JpZ2luOiB1cmlQYXJ0c1swXSxcbiAgICAgIHByb3RvY29sOiB1cmlQYXJ0c1sxXSxcbiAgICAgIHByb3RvY29sbWFyazogdXJpUGFydHNbMl0sXG4gICAgICBob3N0bmFtZTogdXJpUGFydHNbM10sXG4gICAgICBwb3J0OiB1cmlQYXJ0c1s0XSxcbiAgICAgIHBhdGg6IHVyaVBhcnRzWzVdLFxuICAgICAgc2VhcmNoOiB1cmlQYXJ0c1s2XSxcbiAgICAgIGhhc2g6IHVyaVBhcnRzWzddLFxuICAgICAgaHJlZjogdXJpU3RyaW5nLFxuICAgICAgdXJpUGFydHM6IHVyaVBhcnRzXG4gICAgfTtcbiAgfTtcblxuICAvKipcbiAgICogVGVzdHMgaWYgYSB1cmkgaGFzIGEgcHJvdG9jb2xcbiAgICogQHJldHVybiB7Ym9vbGVhbn0gaWYgdGhlIHVyaSBoYXMgYSBwcm90b2NvbFxuICAgKi9cbiAgRmlsZS5oYXNQcm90b2NvbCA9IGZ1bmN0aW9uIChwYXRoKSB7XG4gICAgcmV0dXJuIC9eKD86KGh0dHBzP3xmaWxlKSg6XFwvXFwvXFwvPykpL2cudGVzdChwYXRoKSA9PT0gZmFsc2U7XG4gIH07XG5cbiAgLyoqXG4gICAqIFRlc3QgaXMgdGhlIGlucHV0IGNvbnN0YWlucyB0aGUgZmlsZSBwcm90b2NvbCBkZWxpbWl0ZXIuXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59IFRydWUgaXMgaXQgaXMgYSBmaWxlIHByb3RvY29sLCBvdGh0ZXJ3aXNlIGZhbHNlXG4gICAqL1xuICBGaWxlLmlzRmlsZVByb3RvY29sID0gZnVuY3Rpb24gKHByb3RvY29sU3RyaW5nKSB7XG4gICAgcmV0dXJuIC9eZmlsZTovZ21pLnRlc3QocHJvdG9jb2xTdHJpbmcpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBUZXN0IGlzIHRoZSBpbnB1dCBjb25zdGFpbnMgdGhlIGh0dHAvaHR0cHMgcHJvdG9jb2wgZGVsaW1pdGVyLlxuICAgKiBAcmV0dXJuIHtib29sZWFufSBUcnVlIGlzIGl0IGlzIGFuIGh0dHAgcHJvdG9jb2wsIG90aHRlcndpc2UgZmFsc2VcbiAgICovXG4gIEZpbGUuaXNIdHRwUHJvdG9jb2wgPSBmdW5jdGlvbiAocHJvdG9jb2xTdHJpbmcpIHtcbiAgICByZXR1cm4gL15odHRwcz86L2dtaS50ZXN0KHByb3RvY29sU3RyaW5nKTtcbiAgfTtcblxuICAvKipcbiAgICogQnVpbGQgYW5kIGZpbGUgb2JqZWN0IHdpdGggdGhlIGltcG9ydGFudCBwaWVjZXNcbiAgICovXG4gIEZpbGUucGFyc2VGaWxlTmFtZSA9IGZ1bmN0aW9uIChmaWxlU3RyaW5nKSB7XG4gICAgdmFyIGZpbGVOYW1lO1xuICAgIHZhciBwYXRoTmFtZSA9IGZpbGVTdHJpbmcucmVwbGFjZSgvKFteL10rKSQvZ21pLCBmdW5jdGlvbihtYXRjaCkge1xuICAgICAgZmlsZU5hbWUgPSBtYXRjaDtcbiAgICAgIHJldHVybiBcIlwiO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6IGZpbGVOYW1lIHx8IFwiXCIsXG4gICAgICBwYXRoOiBwYXRoTmFtZVxuICAgIH07XG4gIH07XG5cbiAgLyoqXG4gICAqIE1ldGhvZCB0byBhZGQgYW4gZXh0ZW5zaW9uIGlmIG9uZSBkb2VzIG5vdCBleGlzdCBpbiB0aGUgZmlsZVN0cmluZy4gIEl0IGRvZXMgTk9UIHJlcGxhY2VcbiAgICogdGhlIGZpbGUgZXh0ZW5zaW9uIGlmIG9uZSBhbHJlYWR5IGV4aXN0cyBpbiBgZmlsZVN0cmluZ2AuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlU3RyaW5nIC0gRmlsZSBzdHJpbmcgdG8gYWRkIHRoZSBleHRlbnNpb24gdG8gaWYgb25lIGRvZXMgbm90IGV4aXN0XG4gICAqIEBwYXJhbSB7c3RyaW5nfSBleHRlbnNpb24gLSBFeHRlbnNpb24gdG8gYWRkIGlmIG9uZSBkb2VzIG5vdCBleGlzdCBpbiBgZmlsZVN0cmluZ2AuIFRoZVxuICAgKiAgIHZhbHVlIGlzIHRoZSBleHRlbnNpb24gd2l0aG91dCB0aGUgYC5gLiBFLmcuIGBqc2AsIGBodG1sYC4gIE5vdCBgLmpzYCwgYC5odG1sYC5cbiAgICogQHJldHVybnMge3N0cmluZ30gTmV3IGZpbGVTdHJpbmcgd2l0aCB0aGUgbmV3IGV4dGVuc2lvbiBpZiBvbmUgZGlkIG5vdCBleGlzdFxuICAgKi9cbiAgRmlsZS5hZGRFeHRlbnNpb24gPSBmdW5jdGlvbihmaWxlU3RyaW5nLCBleHRlbnNpb24pIHtcbiAgICB2YXIgZmlsZU5hbWUgID0gRmlsZS5wYXJzZUZpbGVOYW1lKGZpbGVTdHJpbmcpLFxuICAgICAgICBmaWxlUGFydHMgPSBmaWxlTmFtZS5uYW1lLnNwbGl0KFwiLlwiKTtcblxuICAgIGlmIChmaWxlUGFydHMubGVuZ3RoID09PSAxICYmIGV4dGVuc2lvbikge1xuICAgICAgZmlsZVBhcnRzLnB1c2goZXh0ZW5zaW9uKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmlsZU5hbWUucGF0aCArIGZpbGVQYXJ0cy5qb2luKFwiLlwiKTtcbiAgfTtcblxuICAvKipcbiAgICogTWV0aG9kIHRvIHJlcGxhY2UgYW4gZXh0ZW5zaW9uLCBpZiBvbmUgZG9lcyBub3QgZXhpc3QgaW4gdGhlIGZpbGUgc3RyaW5nLCBpdCB3aWxsIGJlIGFkZGVkLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gZmlsZVN0cmluZyAtIEZpbGUgc3RyaW5nIHRvIGFkZCB0aGUgZXh0ZW5zaW9uIHRvIGlmIG9uZSBkb2VzIG5vdCBleGlzdFxuICAgKiBAcGFyYW0ge3N0cmluZ30gZXh0ZW5zaW9uIC0gRXh0ZW5zaW9uIHRvIGJlIGVpdGhlciBhZGRlZCB0byBgZmlsZVN0cmluZ2Agb3IgdG8gcmVwbGFjZSB0aGUgZXh0ZW5zaW9uIGluIGBmaWxlU3RyaW5nYC4gVGhlXG4gICAqICAgdmFsdWUgaXMgdGhlIGV4dGVuc2lvbiB3aXRob3V0IHRoZSBgLmAuIEUuZy4gYGpzYCwgYGh0bWxgLiAgTm90IGAuanNgLCBgLmh0bWxgLlxuICAgKiBAcmV0dXJucyB7c3RyaW5nfSBmaWxlU3RyaW5nIHdpdGggdGhlIG5ldyBleHRlbnNpb25cbiAgICovXG4gIEZpbGUucmVwbGFjZUV4dGVuc2lvbiA9IGZ1bmN0aW9uKGZpbGVTdHJpbmcsIGV4dGVuc2lvbikge1xuICAgIHZhciByZWdleCA9IC8oW14uXFwvXFxcXF0rXFwuKVteLl0rJC87XG4gICAgaWYgKGZpbGVTdHJpbmcubWF0Y2gocmVnZXgpKSB7XG4gICAgICByZXR1cm4gZmlsZVN0cmluZy5yZXBsYWNlKHJlZ2V4LCBcIiQxXCIgKyBleHRlbnNpb24pO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHJldHVybiBmaWxlU3RyaW5nICsgXCIuXCIgKyBleHRlbnNpb247XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGFsbCBmb3J3YXJkIGFuZCBiYWNrIHNsYXNoZXMgdG8gZm9yd2FyZCBzbGFzaGVzIGFzIHdlbGwgYXMgYWxsIGR1cGxpY2F0ZXMgc2xhc2hlc1xuICAgKiBhbmQgcmVzb2x2ZSBhbGwgLiBhbmQgLi4gaW4gdGhlIHBhdGguXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoIC0gUGF0aCB0byBub3JtYWxpemVcbiAgICogQHJldHVybiB7c3RyaW5nfSBwYXRoIHdpdGggb25seSBvbmUgZm9yd2FyZCBzbGFzaCBhIHBhdGggZGVsaW10ZXJzXG4gICAqL1xuICBGaWxlLm5vcm1hbGl6ZSA9IGZ1bmN0aW9uIChwYXRoKSB7XG4gICAgdmFyIHBhdGhQYXJ0cyA9IHBhdGgucmVwbGFjZSgvW1xcXFwvXSsvZywgXCIvXCIpLnNwbGl0KFwiL1wiKSxcbiAgICAgICAgcGF0aENvdW50ID0gcGF0aFBhcnRzLmxlbmd0aCAtIDEsXG4gICAgICAgIHNraXAgICAgICA9IDAsXG4gICAgICAgIG5ld1BhdGggICA9IFtdO1xuXG4gICAgd2hpbGUgKHBhdGhDb3VudCA+PSAwKSB7XG4gICAgICBpZiAocGF0aENvdW50ID4gMCkge1xuICAgICAgICBpZiAocGF0aFBhcnRzW3BhdGhDb3VudF0gPT09IFwiLi5cIikge1xuICAgICAgICAgIHBhdGhDb3VudCAtPSAxOyBza2lwKys7IGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHBhdGhQYXJ0c1twYXRoQ291bnRdID09PSBcIi5cIikge1xuICAgICAgICAgIHBhdGhDb3VudCAtPSAxOyBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoc2tpcCkge1xuICAgICAgICBwYXRoQ291bnQgLT0gc2tpcDtcbiAgICAgICAgc2tpcCA9IDA7XG4gICAgICB9XG5cbiAgICAgIG5ld1BhdGgudW5zaGlmdChwYXRoUGFydHNbcGF0aENvdW50XSk7XG4gICAgICBwYXRoQ291bnQtLTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3UGF0aC5qb2luKCcvJyk7XG4gIH07XG5cbiAgLyoqXG4gICAqIE1lcmdlcyBhIHBhdGggd2l0aCBhIGJhc2UuICBUaGlzIGlzIHVzZWQgZm9yIGhhbmRsaW5nIHJlbGF0aXZlIHBhdGhzLlxuICAgKiBAcmV0dXJuIHtzdHJpbmd9IE1lcmdlIHBhdGhcbiAgICovXG4gIEZpbGUubWVyZ2VQYXRocyA9IGZ1bmN0aW9uIChwYXRoLCBiYXNlKSB7XG4gICAgaWYgKHBhdGhbMF0gPT09ICcvJykge1xuICAgICAgcmV0dXJuIEZpbGUubm9ybWFsaXplKHBhdGgpO1xuICAgIH1cblxuICAgIGlmIChiYXNlICYmIHBhdGgpIHtcbiAgICAgIHBhdGggPSBiYXNlICsgXCIvXCIgKyBwYXRoO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHBhdGggPSBwYXRoIHx8IGJhc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIEZpbGUubm9ybWFsaXplKHBhdGgpO1xuICB9O1xuXG4gIG1vZHVsZS5leHBvcnRzID0gRmlsZTtcbn0pKCk7XG4iXX0=
