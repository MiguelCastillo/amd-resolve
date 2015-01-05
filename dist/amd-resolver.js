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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvcmVzb2x2ZXIuanMiLCJzcmMvZmlsZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIoZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIHZhciBGaWxlID0gcmVxdWlyZSgnLi9maWxlJyk7XG5cbiAgLyoqXG4gICAqIEBjb25zdHJ1Y3RvciBSZXNvbHZlciAtIHByb3ZpZGVzIGEgd2F5IHRvIHRha2UgYSBjb25maWd1cmF0aW9uIHN1Y2ggYXMgb25lXG4gICAqIGZyb20gcmVxdWlyZWpzIHRvIGNvbnZlcnQgbW9kdWxlIG5hbWVzL2lkcyB0byBtb2R1bGUgbWV0YSBvYmplY3RzLiBNb2R1bGUgbWV0YVxuICAgKiBvYmplY3RzIGNvbnRhaW4gaW5mb3JtYXRpb24gc3VjaCBhcyB0aGUgdXJsIGZvciB0aGUgbW9kdWxlLCB3aGljaCBjYW4gYmUgdXNlZFxuICAgKiBmb3IgcmV0cmlldmluZyB0aGUgY29ycmVzcG9uZGluZyBmaWxlIGZyb20gYSByZW1vdGUgc2V2ZXIuXG4gICAqL1xuICBmdW5jdGlvbiBSZXNvbHZlcihvcHRpb25zKSB7XG4gICAgdGhpcy5zZXR0aW5ncyA9IG9wdGlvbnMgfHwge307XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIG1vZHVsZSBtZXRhIGZyb20gYSBtb2R1bGUgbmFtZS9pZC5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBNb2R1bGUgbmFtZS9pZFxuICAgKlxuICAgKiBAcmV0dXJucyB7e25hbWU6IHN0cmluZywgZmlsZTogRmlsZSwgdXJsQXJnczogc3RyaW5nLCBzaGltOiBvYmplY3R9fVxuICAgKi9cbiAgUmVzb2x2ZXIucHJvdG90eXBlLnJlc29sdmUgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIGksIGxlbmd0aCwgcGtnLCBwa2dQYXJ0cywgcGtnTmFtZSwgcGtnVGFyZ2V0LCBzaGltO1xuICAgIHZhciBzZXR0aW5ncyA9IHRoaXMuc2V0dGluZ3MsXG4gICAgICAgIHNoaW1zICAgID0gc2V0dGluZ3Muc2hpbSB8fCB7fSxcbiAgICAgICAgcGFja2FnZXMgPSBzZXR0aW5ncy5wYWNrYWdlcyB8fCBbXSxcbiAgICAgICAgZmlsZU5hbWUgPSAoc2V0dGluZ3MucGF0aHMgJiYgc2V0dGluZ3MucGF0aHNbbmFtZV0pIHx8IG5hbWUsXG4gICAgICAgIHBsdWdpbnMgID0gbmFtZS5zcGxpdChcIiFcIik7XG5cbiAgICAvLyBUaGUgbGFzdCBpdGVtIGlzIHRoZSBhY3R1YWwgbW9kdWxlIG5hbWUuXG4gICAgbmFtZSAgICAgID0gcGx1Z2lucy5wb3AoKTtcbiAgICBwa2dQYXJ0cyAgPSBuYW1lLnJlcGxhY2UoL1tcXC9cXFxcXSsvZywgXCIvXCIpLnNwbGl0KFwiL1wiKTtcbiAgICBwa2dOYW1lICAgPSBwa2dQYXJ0cy5zaGlmdCgpO1xuICAgIHBrZ1RhcmdldCA9IHBrZ1BhcnRzLmpvaW4oXCIvXCIpO1xuXG4gICAgLy8gR28gdGhyb3VnaCB0aGUgcGFja2FnZXMgYW5kIGZpZ3VyZSBpZiB0aGUgbW9kdWxlIGlzIGFjdHVhbGx5IGNvbmZpZ3VyZWQgYXMgc3VjaC5cbiAgICBmb3IgKGkgPSAwLCBsZW5ndGggPSBwYWNrYWdlcy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgcGtnID0gcGFja2FnZXNbaV07XG5cbiAgICAgIGlmIChwa2cgPT09IHBrZ05hbWUpIHtcbiAgICAgICAgZmlsZU5hbWUgPSBwa2dOYW1lICsgXCIvXCIgKyBcIm1haW5cIjtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChwa2cubmFtZSA9PT0gcGtnTmFtZSkge1xuICAgICAgICBmaWxlTmFtZSA9IHBrZy5sb2NhdGlvbiA/IChwa2cubG9jYXRpb24gKyBcIi9cIikgOiBcIlwiO1xuICAgICAgICBmaWxlTmFtZSArPSBwa2dOYW1lICsgXCIvXCIgKyAocGtnVGFyZ2V0IHx8IChwa2cubWFpbiB8fCBcIm1haW5cIikpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc2hpbXMuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcbiAgICAgIHNoaW0gPSB7XG4gICAgICAgIG5hbWU6IHNoaW1zW25hbWVdLmV4cG9ydHMgfHwgc2hpbXNbbmFtZV0ubmFtZSB8fCBuYW1lLFxuICAgICAgICBkZXBzOiBzaGltc1tuYW1lXS5pbXBvcnRzIHx8IHNoaW1zW25hbWVdLmRlcHMgfHwgW11cbiAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6IG5hbWUsXG4gICAgICBmaWxlOiBuZXcgRmlsZShGaWxlLmFkZEV4dGVuc2lvbihmaWxlTmFtZSwgXCJqc1wiKSwgc2V0dGluZ3MuYmFzZVVybCksXG4gICAgICB1cmxBcmdzOiBzZXR0aW5ncy51cmxBcmdzLFxuICAgICAgc2hpbTogc2hpbSxcbiAgICAgIHBsdWdpbnM6IHBsdWdpbnNcbiAgICB9O1xuICB9O1xuXG4gIFJlc29sdmVyLkZpbGUgPSBGaWxlO1xuICBtb2R1bGUuZXhwb3J0cyA9IFJlc29sdmVyO1xufSkoKTtcbiIsIihmdW5jdGlvbigpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgZnVuY3Rpb24gRmlsZSAoZmlsZVVyaSwgYmFzZVVyaSkge1xuICAgIHZhciBmaWxlTmFtZSwgbWVyZ2VkUGF0aDtcbiAgICBiYXNlVXJpID0gYmFzZVVyaSB8fCBcIlwiO1xuICAgIGZpbGVVcmkgPSBGaWxlLnBhcnNlVXJpKGZpbGVVcmkpO1xuXG4gICAgaWYgKGZpbGVVcmkucHJvdG9jb2wgfHwgIWJhc2VVcmkpIHtcbiAgICAgIGZpbGVOYW1lID0gRmlsZS5wYXJzZUZpbGVOYW1lKGZpbGVVcmkucGF0aCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgYmFzZVVyaSAgICA9IEZpbGUucGFyc2VVcmkoYmFzZVVyaSk7XG4gICAgICBtZXJnZWRQYXRoID0gRmlsZS5tZXJnZVBhdGhzKGZpbGVVcmkucGF0aCwgYmFzZVVyaSA/IGJhc2VVcmkucGF0aCA6IFwiL1wiKTtcbiAgICAgIGZpbGVOYW1lICAgPSBGaWxlLnBhcnNlRmlsZU5hbWUobWVyZ2VkUGF0aCk7XG4gICAgfVxuXG4gICAgdGhpcy5fZmlsZSAgICA9IGZpbGVVcmk7XG4gICAgdGhpcy5wcm90b2NvbCA9IGZpbGVVcmkucHJvdG9jb2wgPyBmaWxlVXJpLnByb3RvY29sICsgZmlsZVVyaS5wcm90b2NvbG1hcmsgOiB1bmRlZmluZWQ7XG4gICAgdGhpcy5uYW1lICAgICA9IGZpbGVOYW1lLm5hbWU7XG4gICAgdGhpcy5wYXRoICAgICA9IGZpbGVOYW1lLnBhdGg7XG4gIH1cblxuICBGaWxlLnByb3RvdHlwZS50b1VybCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZmlsZSA9IHRoaXM7XG4gICAgcmV0dXJuIChmaWxlLnByb3RvY29sIHx8IFwiXCIpICsgKGZpbGUucGF0aCB8fCBcIlwiKSArIGZpbGUubmFtZTtcbiAgfTtcblxuICAvKipcbiAgICogUGFyc2VzIG91dCB1cmlcbiAgICovXG4gIEZpbGUucGFyc2VVcmkgPSBmdW5jdGlvbih1cmlTdHJpbmcpIHtcbiAgICBpZiAoIXVyaVN0cmluZykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTXVzdCBwcm92aWRlIGEgc3RyaW5nIHRvIHBhcnNlXCIpO1xuICAgIH1cblxuICAgIGlmIChGaWxlLmlzSHR0cFByb3RvY29sKHVyaVN0cmluZykpIHtcbiAgICAgIHJldHVybiBGaWxlLnBhcnNlSHR0cFByb3RvY29sKHVyaVN0cmluZyk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcmV0dXJuIEZpbGUucGFyc2VGaWxlUHJvdG9jb2wodXJpU3RyaW5nKTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIFBhcnNlcyBvdXQgdGhlIHN0cmluZyBpbnRvIGZpbGUgY29tcG9uZW50c1xuICAgKiByZXR1cm4ge29iamVjdH0gZmlsZSBvYmplY3RcbiAgICovXG4gIEZpbGUucGFyc2VGaWxlUHJvdG9jb2wgPSBmdW5jdGlvbiAodXJpU3RyaW5nKSB7XG4gICAgdmFyIHVyaVBhcnRzID0gL14oPzooZmlsZTopKFxcL1xcL1xcLz8pKT8oKFtBLVphLXotXSs6KT9bL1xcXFxkXFx3XFwuXFxzLV0rKS9nbWkuZXhlYyh1cmlTdHJpbmcpO1xuICAgIHVyaVBhcnRzLnNoaWZ0KCk7XG5cbiAgICAvLyBNYWtlIHN1cmUgd2Ugc2FuaXRpemUgdGhlIHNsYXNoZXNcbiAgICBpZiAodXJpUGFydHNbMl0pIHtcbiAgICAgIHVyaVBhcnRzWzJdID0gRmlsZS5ub3JtYWxpemUodXJpUGFydHNbMl0pO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBwcm90b2NvbDogdXJpUGFydHNbMF0sXG4gICAgICBwcm90b2NvbG1hcms6IHVyaVBhcnRzWzFdLFxuICAgICAgcGF0aDogdXJpUGFydHNbMl0sXG4gICAgICBkcml2ZTogdXJpUGFydHNbM10sXG4gICAgICBocmVmOiB1cmlTdHJpbmcsXG4gICAgICB1cmlQYXJ0czogdXJpUGFydHNcbiAgICB9O1xuICB9O1xuXG4gIC8qKlxuICAgKiBQYXJzZXMgb3V0IGEgc3RyaW5nIGludG8gYW4gaHR0cCB1cmxcbiAgICogQHJldHVybiB7b2JqZWN0fSB1cmwgb2JqZWN0XG4gICAqL1xuICBGaWxlLnBhcnNlSHR0cFByb3RvY29sID0gZnVuY3Rpb24gKHVyaVN0cmluZykge1xuICAgIHZhciB1cmlQYXJ0cyA9IC9eKChodHRwcz86KShcXC9cXC8pKFtcXGRcXHdcXC4tXSspKD86OihcXGQrKSk/KT8oW1xcL1xcXFxcXHdcXC4oKS1dKik/KD86KFs/XVteI10qKT8oIy4qKT8pKi9nbWkuZXhlYyh1cmlTdHJpbmcpO1xuICAgIHVyaVBhcnRzLnNoaWZ0KCk7XG5cbiAgICAvLyBNYWtlIHN1cmUgd2Ugc2FuaXRpemUgdGhlIHNsYXNoZXNcbiAgICBpZiAodXJpUGFydHNbNV0pIHtcbiAgICAgIHVyaVBhcnRzWzVdID0gRmlsZS5ub3JtYWxpemUodXJpUGFydHNbNV0pO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBvcmlnaW46IHVyaVBhcnRzWzBdLFxuICAgICAgcHJvdG9jb2w6IHVyaVBhcnRzWzFdLFxuICAgICAgcHJvdG9jb2xtYXJrOiB1cmlQYXJ0c1syXSxcbiAgICAgIGhvc3RuYW1lOiB1cmlQYXJ0c1szXSxcbiAgICAgIHBvcnQ6IHVyaVBhcnRzWzRdLFxuICAgICAgcGF0aDogdXJpUGFydHNbNV0sXG4gICAgICBzZWFyY2g6IHVyaVBhcnRzWzZdLFxuICAgICAgaGFzaDogdXJpUGFydHNbN10sXG4gICAgICBocmVmOiB1cmlTdHJpbmcsXG4gICAgICB1cmlQYXJ0czogdXJpUGFydHNcbiAgICB9O1xuICB9O1xuXG4gIC8qKlxuICAgKiBUZXN0cyBpZiBhIHVyaSBoYXMgYSBwcm90b2NvbFxuICAgKiBAcmV0dXJuIHtib29sZWFufSBpZiB0aGUgdXJpIGhhcyBhIHByb3RvY29sXG4gICAqL1xuICBGaWxlLmhhc1Byb3RvY29sID0gZnVuY3Rpb24gKHBhdGgpIHtcbiAgICByZXR1cm4gL14oPzooaHR0cHM/fGZpbGUpKDpcXC9cXC9cXC8/KSkvZy50ZXN0KHBhdGgpID09PSBmYWxzZTtcbiAgfTtcblxuICAvKipcbiAgICogVGVzdCBpcyB0aGUgaW5wdXQgY29uc3RhaW5zIHRoZSBmaWxlIHByb3RvY29sIGRlbGltaXRlci5cbiAgICogQHJldHVybiB7Ym9vbGVhbn0gVHJ1ZSBpcyBpdCBpcyBhIGZpbGUgcHJvdG9jb2wsIG90aHRlcndpc2UgZmFsc2VcbiAgICovXG4gIEZpbGUuaXNGaWxlUHJvdG9jb2wgPSBmdW5jdGlvbiAocHJvdG9jb2xTdHJpbmcpIHtcbiAgICByZXR1cm4gL15maWxlOi9nbWkudGVzdChwcm90b2NvbFN0cmluZyk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFRlc3QgaXMgdGhlIGlucHV0IGNvbnN0YWlucyB0aGUgaHR0cC9odHRwcyBwcm90b2NvbCBkZWxpbWl0ZXIuXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59IFRydWUgaXMgaXQgaXMgYW4gaHR0cCBwcm90b2NvbCwgb3RodGVyd2lzZSBmYWxzZVxuICAgKi9cbiAgRmlsZS5pc0h0dHBQcm90b2NvbCA9IGZ1bmN0aW9uIChwcm90b2NvbFN0cmluZykge1xuICAgIHJldHVybiAvXmh0dHBzPzovZ21pLnRlc3QocHJvdG9jb2xTdHJpbmcpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBCdWlsZCBhbmQgZmlsZSBvYmplY3Qgd2l0aCB0aGUgaW1wb3J0YW50IHBpZWNlc1xuICAgKi9cbiAgRmlsZS5wYXJzZUZpbGVOYW1lID0gZnVuY3Rpb24gKGZpbGVTdHJpbmcpIHtcbiAgICB2YXIgZmlsZU5hbWU7XG4gICAgdmFyIHBhdGhOYW1lID0gZmlsZVN0cmluZy5yZXBsYWNlKC8oW14vXSspJC9nbWksIGZ1bmN0aW9uKG1hdGNoKSB7XG4gICAgICBmaWxlTmFtZSA9IG1hdGNoO1xuICAgICAgcmV0dXJuIFwiXCI7XG4gICAgfSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogZmlsZU5hbWUsXG4gICAgICBwYXRoOiBwYXRoTmFtZVxuICAgIH07XG4gIH07XG5cbiAgLyoqXG4gICAqIE1ldGhvZCB0byBhZGQgYW4gZXh0ZW5zaW9uIGlmIG9uZSBkb2VzIG5vdCBleGlzdCBpbiB0aGUgZmlsZVN0cmluZy4gIEl0IGRvZXMgTk9UIHJlcGxhY2VcbiAgICogdGhlIGZpbGUgZXh0ZW5zaW9uIGlmIG9uZSBhbHJlYWR5IGV4aXN0cyBpbiBgZmlsZVN0cmluZ2AuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlU3RyaW5nIC0gRmlsZSBzdHJpbmcgdG8gYWRkIHRoZSBleHRlbnNpb24gdG8gaWYgb25lIGRvZXMgbm90IGV4aXN0XG4gICAqIEBwYXJhbSB7c3RyaW5nfSBleHRlbnNpb24gLSBFeHRlbnNpb24gdG8gYWRkIGlmIG9uZSBkb2VzIG5vdCBleGlzdCBpbiBgZmlsZVN0cmluZ2AuIFRoZVxuICAgKiAgIHZhbHVlIGlzIHRoZSBleHRlbnNpb24gd2l0aG91dCB0aGUgYC5gLiBFLmcuIGBqc2AsIGBodG1sYC4gIE5vdCBgLmpzYCwgYC5odG1sYC5cbiAgICogQHJldHVybnMge3N0cmluZ30gTmV3IGZpbGVTdHJpbmcgd2l0aCB0aGUgbmV3IGV4dGVuc2lvbiBpZiBvbmUgZGlkIG5vdCBleGlzdFxuICAgKi9cbiAgRmlsZS5hZGRFeHRlbnNpb24gPSBmdW5jdGlvbihmaWxlU3RyaW5nLCBleHRlbnNpb24pIHtcbiAgICB2YXIgZmlsZU5hbWUgID0gRmlsZS5wYXJzZUZpbGVOYW1lKGZpbGVTdHJpbmcpLFxuICAgICAgICBmaWxlUGFydHMgPSBmaWxlTmFtZS5uYW1lLnNwbGl0KFwiLlwiKTtcblxuICAgIGlmIChmaWxlUGFydHMubGVuZ3RoID09PSAxICYmIGV4dGVuc2lvbikge1xuICAgICAgZmlsZVBhcnRzLnB1c2goZXh0ZW5zaW9uKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmlsZU5hbWUucGF0aCArIGZpbGVQYXJ0cy5qb2luKFwiLlwiKTtcbiAgfTtcblxuICAvKipcbiAgICogTWV0aG9kIHRvIHJlcGxhY2UgYW4gZXh0ZW5zaW9uLCBpZiBvbmUgZG9lcyBub3QgZXhpc3QgaW4gdGhlIGZpbGUgc3RyaW5nLCBpdCB3aWxsIGJlIGFkZGVkLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gZmlsZVN0cmluZyAtIEZpbGUgc3RyaW5nIHRvIGFkZCB0aGUgZXh0ZW5zaW9uIHRvIGlmIG9uZSBkb2VzIG5vdCBleGlzdFxuICAgKiBAcGFyYW0ge3N0cmluZ30gZXh0ZW5zaW9uIC0gRXh0ZW5zaW9uIHRvIGJlIGVpdGhlciBhZGRlZCB0byBgZmlsZVN0cmluZ2Agb3IgdG8gcmVwbGFjZSB0aGUgZXh0ZW5zaW9uIGluIGBmaWxlU3RyaW5nYC4gVGhlXG4gICAqICAgdmFsdWUgaXMgdGhlIGV4dGVuc2lvbiB3aXRob3V0IHRoZSBgLmAuIEUuZy4gYGpzYCwgYGh0bWxgLiAgTm90IGAuanNgLCBgLmh0bWxgLlxuICAgKiBAcmV0dXJucyB7c3RyaW5nfSBmaWxlU3RyaW5nIHdpdGggdGhlIG5ldyBleHRlbnNpb25cbiAgICovXG4gIEZpbGUucmVwbGFjZUV4dGVuc2lvbiA9IGZ1bmN0aW9uKGZpbGVTdHJpbmcsIGV4dGVuc2lvbikge1xuICAgIHZhciByZWdleCA9IC8oW14uXFwvXFxcXF0rXFwuKVteLl0rJC87XG4gICAgaWYgKGZpbGVTdHJpbmcubWF0Y2gocmVnZXgpKSB7XG4gICAgICByZXR1cm4gZmlsZVN0cmluZy5yZXBsYWNlKHJlZ2V4LCBcIiQxXCIgKyBleHRlbnNpb24pO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHJldHVybiBmaWxlU3RyaW5nICsgXCIuXCIgKyBleHRlbnNpb247XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGFsbCBmb3J3YXJkIGFuZCBiYWNrIHNsYXNoZXMgdG8gZm9yd2FyZCBzbGFzaGVzIGFzIHdlbGwgYXMgYWxsIGR1cGxpY2F0ZXMgc2xhc2hlc1xuICAgKiBhbmQgcmVzb2x2ZSBhbGwgLiBhbmQgLi4gaW4gdGhlIHBhdGguXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoIC0gUGF0aCB0byBub3JtYWxpemVcbiAgICogQHJldHVybiB7c3RyaW5nfSBwYXRoIHdpdGggb25seSBvbmUgZm9yd2FyZCBzbGFzaCBhIHBhdGggZGVsaW10ZXJzXG4gICAqL1xuICBGaWxlLm5vcm1hbGl6ZSA9IGZ1bmN0aW9uIChwYXRoKSB7XG4gICAgdmFyIHBhdGhQYXJ0cyA9IHBhdGgucmVwbGFjZSgvW1xcXFwvXSsvZywgXCIvXCIpLnNwbGl0KFwiL1wiKSxcbiAgICAgICAgcGF0aENvdW50ID0gcGF0aFBhcnRzLmxlbmd0aCAtIDEsXG4gICAgICAgIHNraXAgICAgICA9IDAsXG4gICAgICAgIG5ld1BhdGggICA9IFtdO1xuXG4gICAgd2hpbGUgKHBhdGhDb3VudCA+PSAwKSB7XG4gICAgICBpZiAocGF0aENvdW50ID4gMCkge1xuICAgICAgICBpZiAocGF0aFBhcnRzW3BhdGhDb3VudF0gPT09IFwiLi5cIikge1xuICAgICAgICAgIHBhdGhDb3VudCAtPSAxOyBza2lwKys7IGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHBhdGhQYXJ0c1twYXRoQ291bnRdID09PSBcIi5cIikge1xuICAgICAgICAgIHBhdGhDb3VudCAtPSAxOyBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoc2tpcCkge1xuICAgICAgICBwYXRoQ291bnQgLT0gc2tpcDtcbiAgICAgICAgc2tpcCA9IDA7XG4gICAgICB9XG5cbiAgICAgIG5ld1BhdGgudW5zaGlmdChwYXRoUGFydHNbcGF0aENvdW50XSk7XG4gICAgICBwYXRoQ291bnQtLTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3UGF0aC5qb2luKCcvJyk7XG4gIH07XG5cbiAgLyoqXG4gICAqIE1lcmdlcyBhIHBhdGggd2l0aCBhIGJhc2UuICBUaGlzIGlzIHVzZWQgZm9yIGhhbmRsaW5nIHJlbGF0aXZlIHBhdGhzLlxuICAgKiBAcmV0dXJuIHtzdHJpbmd9IE1lcmdlIHBhdGhcbiAgICovXG4gIEZpbGUubWVyZ2VQYXRocyA9IGZ1bmN0aW9uIChwYXRoLCBiYXNlKSB7XG4gICAgaWYgKHBhdGhbMF0gPT09ICcvJykge1xuICAgICAgcmV0dXJuIEZpbGUubm9ybWFsaXplKHBhdGgpO1xuICAgIH1cblxuICAgIGlmIChiYXNlICYmIHBhdGgpIHtcbiAgICAgIHBhdGggPSBiYXNlICsgXCIvXCIgKyBwYXRoO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHBhdGggPSBwYXRoIHx8IGJhc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIEZpbGUubm9ybWFsaXplKHBhdGgpO1xuICB9O1xuXG4gIG1vZHVsZS5leHBvcnRzID0gRmlsZTtcbn0pKCk7XG4iXX0=
