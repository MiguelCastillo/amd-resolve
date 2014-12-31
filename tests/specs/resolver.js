define(["dist/resolver"], function(Resolver) {

  describe("Resolver Suite", function() {
    describe("When Resolver is configured with packages", function() {
      var resolver;
      beforeEach(function() {
        resolver = new Resolver({
          "packages": [
            "pacakge1", {
              "name": "package2"
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
      });

      describe("When processing package 'pacakge1'", function() {
        var mod;
        beforeEach(function() {
          mod = resolver.resolve("pacakge1");
        });

        it("then package is 'pacakge1/main.js'", function() {
          expect(mod.file.toUrl()).to.equal("pacakge1/main.js");
        });
      });

      describe("When processing package 'package2'", function() {
        var mod;
        beforeEach(function() {
          mod = resolver.resolve("package2");
        });

        it("then package is 'package2/main.js'", function() {
          expect(mod.file.toUrl()).to.equal("package2/main.js");
        });
      });

      describe("When processing package 'lib'", function() {
        var mod;
        beforeEach(function() {
          mod = resolver.resolve("lib");
        });

        it("then package is 'good/tests/lib/main.js'", function() {
          expect(mod.file.toUrl()).to.equal("good/tests/lib/main.js");
        });
      });

      describe("When processing package 'js'", function() {
        var mod;
        beforeEach(function() {
          mod = resolver.resolve("js");
        });

        it("then package is 'good/tests/js/index.js'", function() {
          expect(mod.file.toUrl()).to.equal("good/tests/js/index.js");
        });
      });
    });


    describe("When Resolver is configured with Shims", function() {
      it("needs tests");
    });


    describe("When Resolver is configured with baseUrl", function() {
      it("needs tests");
    });

  });
});
