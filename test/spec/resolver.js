define(["dist/amd-resolver"], function(Resolver) {

  describe("Resolver Suite", function() {
    describe("When Resolver is configured with `packages`", function() {
      var resolver;
      beforeEach(function() {
        resolver = new Resolver({
          "packages": [
            "pacakge1", {
              "name": "package2"
            }, {
              "location": "good/tests",
              "main": "index",
              "name": "assets"
            }, {
              "location": "good/tests",
              "name": "lib"
            }
          ]
        });
      });

      describe("When processing package 'pacakge1'", function() {
        var moduleMeta;
        beforeEach(function() {
          moduleMeta = resolver.resolve("pacakge1");
        });

        it("then package is 'pacakge1/main.js'", function() {
          expect(moduleMeta.file.toUrl()).to.equal("pacakge1/main.js");
        });
      });

      describe("And processing package 'package2'", function() {
        var moduleMeta;
        beforeEach(function() {
          moduleMeta = resolver.resolve("package2");
        });

        it("then package is 'package2/main.js'", function() {
          expect(moduleMeta.file.toUrl()).to.equal("package2/main.js");
        });
      });

      describe("And processing package 'lib'", function() {
        var moduleMeta;
        beforeEach(function() {
          moduleMeta = resolver.resolve("lib");
        });

        it("then package is 'good/tests/lib/main.js'", function() {
          expect(moduleMeta.file.toUrl()).to.equal("good/tests/lib/main.js");
        });
      });

      describe("And processing package `assets`", function() {
        it("then resolving package `assets` is `good/tests/assets/index.js`", function() {
          var moduleMeta = resolver.resolve("assets");
          expect(moduleMeta.file.toUrl()).to.equal("good/tests/assets/index.js");
        });

        it("then resolving `assets/library/mod` is 'good/tests/assets/library/mod.js'", function() {
          var moduleMeta = resolver.resolve("assets/library/mod");
          expect(moduleMeta.file.toUrl()).to.equal("good/tests/assets/library/mod.js");
        });

        it("then resolving `assets/library/mod.js` is 'good/tests/assets/library/mod.js'", function() {
          var moduleMeta = resolver.resolve("assets/library/mod.js");
          expect(moduleMeta.file.toUrl()).to.equal("good/tests/assets/library/mod.js");
        });

        it("then resolving `assets/library/template.html` is 'good/tests/assets/library/template.html'", function() {
          var moduleMeta = resolver.resolve("assets/library/template.html");
          expect(moduleMeta.file.toUrl()).to.equal("good/tests/assets/library/template.html");
        });
      });
    });


    describe("When Resolver is configured with `shim`", function() {
      var resolver;
      beforeEach(function() {
        resolver = new Resolver({
          "shim": {
            "machine": {
              "exports": "mch"
            },
            "jimmy": {
              "name": "coffee",
              "deps": ["trucks", "passport"]
            },
            "macho": {
              "exports": "camacho",
              "imports": ["guns", "president"]
            }
          }
        });
      });

      describe("and resolving shim `machine`", function() {
        var moduleMeta;
        beforeEach(function() {
          moduleMeta = resolver.resolve("machine");
        });

        it("then shim is an object", function() {
          expect(moduleMeta.shim).to.be.an("object");
        });

        it("exports is `mch`", function() {
          expect(moduleMeta.shim.name).to.equal("mch");
        });

        it("deps is an array", function() {
          expect(moduleMeta.shim.deps).to.be.an("array");
        });

        it("deps is empty", function() {
          expect(moduleMeta.shim.deps.length).to.equal(0);
        });
      });

      describe("and resolving shim `jimmy`", function() {
        var moduleMeta;
        beforeEach(function() {
          moduleMeta = resolver.resolve("jimmy");
        });

        it("then shim is an object", function() {
          expect(moduleMeta.shim).to.be.an("object");
        });

        it("name is `coffee`", function() {
          expect(moduleMeta.shim.name).to.equal("coffee");
        });

        it("deps is an array", function() {
          expect(moduleMeta.shim.deps).to.be.an("array");
        });

        it("deps to have two entries", function() {
          expect(moduleMeta.shim.deps.length).to.equal(2);
        });

        it("deps[0] is `trucks`", function() {
          expect(moduleMeta.shim.deps[0]).to.equal("trucks");
        });

        it("deps[1] is `passport`", function() {
          expect(moduleMeta.shim.deps[1]).to.equal("passport");
        });
      });

      describe("and resolving shim `macho`", function() {
        var moduleMeta;
        beforeEach(function() {
          moduleMeta = resolver.resolve("macho");
        });

        it("then shim is an object", function() {
          expect(moduleMeta.shim).to.be.an("object");
        });

        it("then shim exports `camacho`", function() {
          expect(moduleMeta.shim.name).to.equal("camacho");
        });

        it("them shim imports `guns`", function() {
          expect(moduleMeta.shim.deps[0]).to.equal("guns");
        });

        it("them shim imports `president`", function() {
          expect(moduleMeta.shim.deps[1]).to.equal("president");
        });
      });

      describe("and resolving with `unknown`", function() {
        var moduleMeta;
        beforeEach(function() {
          moduleMeta = resolver.resolve("unknown");
        });

        it("then shim is undefined", function() {
          expect(moduleMeta.shim).to.undefined();
        });
      });
    });


    describe("When Resolver is configured with `paths`", function() {
      var resolver;
      beforeEach(function() {
        resolver = new Resolver({
          "paths": {
            "machine": "path/to/module/1",
            "kitchen": "../path/to/kitchen/and/sink",
            "tree": "./hugger"
          }
        });
      });


      describe("and resolving with `machine`", function() {
        var moduleMeta;
        beforeEach(function() {
          moduleMeta = resolver.resolve("machine");
        });

        it("then name is `machine`", function() {
          expect(moduleMeta.name).to.equal("machine");
        });

        it("then moduleMeta.file.toUrl() is `path/to/module/1.js`", function() {
          expect(moduleMeta.file.toUrl()).to.equal("path/to/module/1.js");
        });
      });

      describe("and resolving with `kitchen`", function() {
        var moduleMeta;
        beforeEach(function() {
          moduleMeta = resolver.resolve("kitchen");
        });

        it("then name is `kitchen`", function() {
          expect(moduleMeta.name).to.equal("kitchen");
        });

        it("then moduleMeta.file.toUrl() is `../path/to/kitchen/and/sink.js`", function() {
          expect(moduleMeta.file.toUrl()).to.equal("../path/to/kitchen/and/sink.js");
        });
      });

      describe("and resolving with `tree`", function() {
        var moduleMeta;
        beforeEach(function() {
          moduleMeta = resolver.resolve("tree");
        });

        it("then name is `tree`", function() {
          expect(moduleMeta.name).to.equal("tree");
        });

        it("then moduleMeta.file.toUrl() is `./hugger.js`", function() {
          expect(moduleMeta.file.toUrl()).to.equal("./hugger.js");
        });
      });
    });


    describe("When Resolver has plugins", function() {
      var resolver;
      beforeEach(function() {
        resolver = new Resolver();
      });

      describe("and a module name is `path/to/file.css`", function() {
        var moduleMeta;
        beforeEach(function() {
          moduleMeta = resolver.resolve("path/to/file.css");
        });

        it("then module name is `path/to/file.css`", function() {
          expect(moduleMeta.name).to.equal("path/to/file.css");
        });

        it("then first plugin is an empty array", function() {
          expect(moduleMeta.plugins.length).to.equal(0);
        });
      });

      describe("and a module name is `less!css!path/to/file.css`", function() {
        var moduleMeta;
        beforeEach(function() {
          moduleMeta = resolver.resolve("less!css!path/to/file.css");
        });

        it("then module name is `path/to/file.css`", function() {
          expect(moduleMeta.name).to.equal("path/to/file.css");
        });

        it("then first plugin is an array with two items", function() {
          expect(moduleMeta.plugins.length).to.equal(2);
        });

        it("then first plugin is `less`", function() {
          expect(moduleMeta.plugins[0]).to.equal("less");
        });

        it("then second plugin is `css`", function() {
          expect(moduleMeta.plugins[1]).to.equal("css");
        });
      });
    });


    describe("When Resolver is configured with `baseUrl`", function() {
      it("needs tests");
    });

  });
});
