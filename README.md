amd-resolver
===========

Resolve AMD module names to a module meta with a File object.

### API

#### Resolver(options : object) : constructor
Resolver - provides the means to convert a module name to a module meta object. A module meta object contains information such as a url, which can be used for fetching the module file from a remote sever.

@param {object} `options` - is a configuration object for properly creating module meta objects.  It is compatible with requirejs settings for `paths`, `packages`, `baseUrl`, `shim`, and `urlArgs`.

- @property {string} `baseUrl` - path every file is relative to.

- @property {object} `paths` - is an object with key value pairs to map module names to files.

  For example, if you wanted to have a module called `md5` and you wanted to map that to the location of the actual file, you can define the following:

  ``` javascript
  {
    "paths": {
      "md5": "path/to/file/module"
    }
  }
  ```

  That will tell the resolver the location for `md5` to create a proper file object that points to `path/to/file/module`.

- @property {array} `packages` - is an array for defining directory aliases to files. Think npm packages that have an `index.js` or a `main.js`.

  A package can just be a string, in which case resolver will generate urls in the form of `packagename/main.js`. That is to say that if you have a package called `machines`, then resolving that package will generate a url to `machinge/main.js`.

  Alternatively, a package can be an object used for more granual control of the resolution process. The following properties are supported:

  - @property {string} `location` - which is the location on disk.
  - @property {string} `main` - file name. Define if `main.js` is not the correct file.
  - @property {string} `name` - package name.


- @property {object} `shim` - maps code in the global object to modules.  An example of this is `Backbone`.  So, in order to consume `Backbone` as a dependency in your module, resolver needs to know how to find it in the global object, and load its dependencies (`underscore`).

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

  - @property {string} `name` - is the name of the module being resolved. Plugin definitions are stripped out.
  - @property {File} `file` - is the object that can generate a URL to request the module file from a remote server.
  - @property {string} `urlArgs` - cgi parameters to be used when requesting the module file from a remote server.
  - @property {array} `plugins` - array of strings created from the module name.  Anything at the beginning of the module name that is delimited with `!` will be treated as a plugin.
  - @property {object} `shim` - which is the an object containing information about the module as it exists in the global object. `shim` can specify a couple of things.
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
var mochaUrl    = mochaModuleMeta.file.toUrl(),    // url === "../node_modules/mocha/mocha.js"
    package1Url = package1ModuleMeta.file.toUrl(), // url === "package1/index.js"
    cssUrl      = cssModuleMeta.file.toUrl();      // url === "path/to/file.less"
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
