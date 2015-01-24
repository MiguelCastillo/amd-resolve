amd-resolver
===========

[![Build Status](https://travis-ci.org/MiguelCastillo/amd-resolver.svg?branch=master)](https://travis-ci.org/MiguelCastillo/amd-resolver)
[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/MiguelCastillo/amd-resolver?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Resolve AMD module names to File objects suitable to run in the Browser.

### API

#### Resolver(options : object) : constructor
Resolver - provides the means to convert a module name to a module meta object. A module meta object contains information such as a url, which can be used for fetching the module file from a remote sever.

@param {object} `options` - is a configuration object for properly creating module meta objects.  It is compatible with requirejs settings for `paths`, `packages`, `baseUrl`, `shim`, and `urlArgs`.

- @property {string} `baseUrl` - path that every file is relative to.

- @property {object} `paths` - is an object with key value pairs to map module names to files.

  For example, if you wanted to have a module called `md5` and you wanted to map that to the location of the actual file, you can define the following:

  ``` javascript
  {
    "paths": {
      "md5": "path/to/file/module"
    }
  }
  ```

  That will tell resolver the location for `md5` to create a proper file object that points to `path/to/file/module.js`.

- @property {array} `packages` - is an array for defining directory aliases to files. Think npm packages that have an `index.js` or a `main.js`.

  A package can just be a string, in which case resolver will generate urls in the form of `packagename/main.js`. That is to say that if you have a package called `machines`, then resolving that package will generate a url to `machinge/main.js`.

  Alternatively, a package can be an object that gives more granual control of the resolution process. The following properties are supported:

  - @property {string} `location` - which is the location on disk.
  - @property {string} `main` - file name. Provide one if the module file is other than `main.js`.
  - @property {string} `name` - package name.


- @property {object} `shim` - maps code in the global object to modules.  An example of this is `Backbone`, which is loaded into the global object.  So, in order to consume `Backbone` as a dependency in your module, resolver needs to know how to find it in the global object and also know its dependencies (`underscore`).

  Shims provides two options
  - @property {string} `exports | name` - The name of the code in the global object.
  - @property {array} `imports | deps` - List of dependencies.  This is important when the shim needs certain code to be loaded before the shim itself.


##### example

``` javascript
var resolver = new Resolver({
  "urlArgs": 'bust=' + (new Date()).getTime(),
  "baseUrl": "../",
  "paths": {
    "mocha": "../node_modules/mocha/mocha",
    "chai": "../node_modules/chai/chai"
  },
  "shim": {
    "mocha": {
      "exports": "mocha",
      "imports": ["sinon", "chai"]
    }
  },
  "packages": [
    "pacakge1", {
      "main": "index.js"
    }, {
      "location": "good/tests",
      "main": "index",
      "name": "js"
    }, {
      "location": "good/tests",
      "name": "lib"
    }
  ]
});
```

#### resolve(name : string)

Creates a module meta object.

@param {string} `name` - Name of the module to create a module meta object for. The name can be formatted with plugins such as `css!filename.css`.

@returns {object} module meta

  - @property {string} `name` - Name of the module being resolved. Plugin definitions are stripped out.
  - @property {File} `file` - File object with a URL instance that can be used to request the module file from a remote server. For specifics on what's available in the URL instance, please see [URL Api](https://developer.mozilla.org/en-US/docs/Web/API/URL).
  - @property {string} `urlArgs` - cgi parameters to be used when requesting the module file from a remote server.
  - @property {array} `plugins` - Array of strings created from the module name.  Anything at the beginning of the module name that is delimited with `!` will be treated as a plugin.
  - @property {object} `shim` - Is an object containing information about modules that exist in the global object. `shim` can specify a couple of things.
    - @property {string} `name` - which is the name the shim has in the global space.
    - @property {array} `deps` - which is an array of string of dependencies that need to be loaded before the shim.

##### examples:

Create module meta objects
``` javascript
var mochaModuleMeta    = resolver.resolve("mocha"),
    package1ModuleMeta = resolver.resolve("package1"),
    cssModuleMeta      = resolver.resolve("css!less!path/to/file.less");
```

Urls
``` javascript
var mochaUrl    = mochaModuleMeta.file.url.href,    // url === "../node_modules/mocha/mocha.js"
    package1Url = package1ModuleMeta.file.url.href, // url === "package1/index.js"
    cssUrl      = cssModuleMeta.file.url.href;      // url === "path/to/file.less"
```

Plugins
``` javascript
var cssPlugins = cssModuleMeta.plugins; // plugins === ["css", "less"]
```

Shim
``` javascript
var mochaShim = mochaModuleMeta.shim; // shim === {name: "mocha", deps: ["sinon", "chai"]}
```

### Install

#### From npm

```
npm install amd-resolver
```
