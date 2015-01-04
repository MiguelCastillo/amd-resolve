define(["dist/amd-resolver"], function(Resolver) {
  var File = Resolver.File;

  describe("File", function() {
    describe("object", function() {
      it("simple path, no base", function() {
        var file = new File("/path", "");
        expect(file.protocol).to.be.an('undefined');
        expect(file.name).to.equal("path");
        expect(file.path).to.equal("/");
      });

      it("simple path with simple base", function() {
        var file = new File("path", "baseuri");
        expect(file.protocol).to.be.an('undefined');
        expect(file.name).to.equal("path");
        expect(file.path).to.equal("baseuri/");
      });

      it("module with leading double dot and a longer path", function() {
        var file = new File("../module1", "baseuri/path1/path2");
        expect(file.protocol).to.be.an('undefined');
        expect(file.name).to.equal("module1");
        expect(file.path).to.equal("baseuri/path1/");
      });
    });


    describe("parseFileName", function() {
      it("Simple file", function() {
        var fileName = File.parseFileName("/mortarjs.html");
        expect(fileName.name).to.equal("mortarjs.html");
        expect(fileName.path).to.equal("/");
      });

      it("Starting dot directory", function() {
        var fileName = File.parseFileName("./mortarjs.html");
        expect(fileName.name).to.equal("mortarjs.html");
        expect(fileName.path).to.equal("./");
      });

      it("Just file", function() {
        var fileName = File.parseFileName("mortarjs.html");
        expect(fileName.name).to.equal("mortarjs.html");
        expect(fileName.path).to.equal("");
      });

      it("Starting dot file", function() {
        var fileName = File.parseFileName(".mortarjs.html");
        expect(fileName.name).to.equal(".mortarjs.html");
        expect(fileName.path).to.equal("");
      });

      it("Deep path file", function() {
        var fileName = File.parseFileName("/this/is/a/looong/path/to/the/file/mortarjs.html");
        expect(fileName.name).to.equal("mortarjs.html");
        expect(fileName.path).to.equal("/this/is/a/looong/path/to/the/file/");
      });

      it("Deep path with dot leading file", function() {
        var fileName = File.parseFileName("/this/is/a/looong/path/to/the/file/.mortarjs.html");
        expect(fileName.name).to.equal(".mortarjs.html");
        expect(fileName.path).to.equal("/this/is/a/looong/path/to/the/file/");
      });
    });


    describe("when addExtension", function() {
      it("then `test/file.html` is `test/file.html", function() {
        var fileString = File.addExtension("test/file.html", "badextension");
        expect(fileString).to.equal("test/file.html");
      });

      it("then `test/file.ext1.html` is `test/file.ext1.html", function() {
        var fileString = File.addExtension("test/file.ext1.html", "badextension");
        expect(fileString).to.equal("test/file.ext1.html");
      });

      it("then `test/file` is `test/file.js", function() {
        var fileString = File.addExtension("test/file", "js");
        expect(fileString).to.equal("test/file.js");
      });
    });


    describe("Merge path", function() {
      it("no path, simple base", function() {
        var path = File.mergePaths("", "/path");
        expect(path).to.equal("/path");
      });

      it("simple path, no base", function() {
        var path = File.mergePaths("/path");
        expect(path).to.equal("/path");
      });

      it("simple path, empty base", function() {
        var path = File.mergePaths("/path", "");
        expect(path).to.equal("/path");
      });

      it("simple path, simple base", function() {
        var path = File.mergePaths("/path", "/");
        expect(path).to.equal("/path");
      });

      it("path, dotted base path", function() {
        var path = File.mergePaths("/path", "../../test1/test2");
        expect(path).to.equal("/path");
      });

      it("relative path, simple base", function() {
        var path = File.mergePaths("./path", "/");
        expect(path).to.equal("/path");
      });

      it("skip path with base", function() {
        var path = File.mergePaths("../path", "/");
        expect(path).to.equal("/path");
      });

      it("skip path with dotted base", function() {
        var path = File.mergePaths("../path", "./");
        expect(path).to.equal("/path");
      });

      it("skip more path with base", function() {
        var path = File.mergePaths("../../../path", "/");
        expect(path).to.equal("/path");
      });

      it("skip more path with dotted base", function() {
        var path = File.mergePaths("../../../path", "./");
        expect(path).to.equal("/path");
      });

      it("skip path with more base", function() {
        var path = File.mergePaths("../path", "/container/of my/child");
        expect(path).to.equal("/container/of my/path");
      });

      it("skip more path with more base", function() {
        var path = File.mergePaths("../../../path", "/container/of my/child/part1/part2/part3");
        expect(path).to.equal("/container/of my/child/path");
      });

      it("skip more path with more dotted base", function() {
        var path = File.mergePaths("../../../path", "./container/of my/child/part1/part2/part3");
        expect(path).to.equal("./container/of my/child/path");
      });
    });


    describe("parseUri", function() {
      describe("HTTP", function() {
        it("Simple url", function() {
          var urlo = File.parseUri("http://hoistedjs.com");
          expect(urlo.origin).to.equal("http://hoistedjs.com");
          expect(urlo.protocol).to.equal("http:");
          expect(urlo.protocolmark).to.equal("//");
          expect(urlo.hostname).to.equal("hoistedjs.com");
          expect(urlo.port).to.be.an('undefined');
          expect(urlo.path).to.be.an('undefined');
          expect(urlo.search).to.be.an('undefined');
          expect(urlo.hash).to.be.an('undefined');
        });

        it("url with hash", function() {
          var urlo = File.parseUri("http://hoistedjs.com#migration/topic/data");
          expect(urlo.origin).to.equal("http://hoistedjs.com");
          expect(urlo.protocol).to.equal("http:");
          expect(urlo.protocolmark).to.equal("//");
          expect(urlo.hostname).to.equal("hoistedjs.com");
          expect(urlo.port).to.be.an('undefined');
          expect(urlo.path).to.be.an('undefined');
          expect(urlo.search).to.be.an('undefined');
          expect(urlo.hash).to.equal("#migration/topic/data");
        });

        it("url with search", function() {
          var urlo = File.parseUri("http://hoistedjs.com?topic=data");
          expect(urlo.origin).to.equal("http://hoistedjs.com");
          expect(urlo.protocol).to.equal("http:");
          expect(urlo.protocolmark).to.equal("//");
          expect(urlo.hostname).to.equal("hoistedjs.com");
          expect(urlo.port).to.be.an('undefined');
          expect(urlo.path).to.be.an('undefined');
          expect(urlo.search).to.equal("?topic=data");
          expect(urlo.hash).to.be.an('undefined');
        });

        it("url with search and hash", function() {
          var urlo = File.parseUri("http://hoistedjs.com?topic=data#migration/path");
          expect(urlo.origin).to.equal("http://hoistedjs.com");
          expect(urlo.protocol).to.equal("http:");
          expect(urlo.protocolmark).to.equal("//");
          expect(urlo.hostname).to.equal("hoistedjs.com");
          expect(urlo.port).to.be.an('undefined');
          expect(urlo.path).to.be.an('undefined');
          expect(urlo.search).to.equal("?topic=data");
          expect(urlo.hash).to.equal("#migration/path");
        });

        it("url with search and hash and empty path", function() {
          var urlo = File.parseUri("http://hoistedjs.com/?topic=data#migration/path");
          expect(urlo.origin).to.equal("http://hoistedjs.com");
          expect(urlo.protocol).to.equal("http:");
          expect(urlo.protocolmark).to.equal("//");
          expect(urlo.hostname).to.equal("hoistedjs.com");
          expect(urlo.port).to.be.an('undefined');
          expect(urlo.path).to.equal("/");
          expect(urlo.search).to.equal("?topic=data");
          expect(urlo.hash).to.equal("#migration/path");
        });

        it("url with search and hash and simple path", function() {
          var urlo = File.parseUri("http://hoistedjs.com/moretesting?topic=data#migration/path");
          expect(urlo.origin).to.equal("http://hoistedjs.com");
          expect(urlo.protocol).to.equal("http:");
          expect(urlo.protocolmark).to.equal("//");
          expect(urlo.hostname).to.equal("hoistedjs.com");
          expect(urlo.port).to.be.an('undefined');
          expect(urlo.path).to.equal("/moretesting");
          expect(urlo.search).to.equal("?topic=data");
          expect(urlo.hash).to.equal("#migration/path");
        });

        it("url with search and hash and simple path with port", function() {
          var urlo = File.parseUri("http://hoistedjs.com:599/moretesting?topic=data#migration/path");
          expect(urlo.origin).to.equal("http://hoistedjs.com:599");
          expect(urlo.protocol).to.equal("http:");
          expect(urlo.protocolmark).to.equal("//");
          expect(urlo.hostname).to.equal("hoistedjs.com");
          expect(urlo.port).to.equal('599');
          expect(urlo.path).to.equal("/moretesting");
          expect(urlo.search).to.equal("?topic=data");
          expect(urlo.hash).to.equal("#migration/path");
        });
      });


      describe("FILE", function() {
        it("Empty string", function() {
          var urlo, _ex;
          try {
            urlo = File.parseUri("");
          }
          catch (ex) {
            _ex = ex;
            expect(ex.message).to.equal("Must provide a string to parse");
          }
          finally {
            expect(_ex).to.be.an('object');
            expect(urlo).to.be.an('undefined');
          }
        });

        it("Single forward slash", function() {
          var urlo = File.parseUri("/");
          expect(urlo.origin).to.be.an('undefined');
          expect(urlo.protocol).to.be.an('undefined');
          expect(urlo.protocolmark).to.be.an('undefined');
          expect(urlo.hostname).to.be.an('undefined');
          expect(urlo.port).to.be.an('undefined');
          expect(urlo.path).to.equal("/");
          expect(urlo.search).to.be.an('undefined');
          expect(urlo.hash).to.be.an('undefined');
        });

        it("Single dot with forward slash", function() {
          var urlo = File.parseUri("./");
          expect(urlo.origin).to.be.an('undefined');
          expect(urlo.protocol).to.be.an('undefined');
          expect(urlo.protocolmark).to.be.an('undefined');
          expect(urlo.hostname).to.be.an('undefined');
          expect(urlo.port).to.be.an('undefined');
          expect(urlo.path).to.equal("./");
          expect(urlo.search).to.be.an('undefined');
          expect(urlo.hash).to.be.an('undefined');
        });

        it("Single dot with multiple back slashes", function() {
          var urlo = File.parseUri(".\\\\\\");
          expect(urlo.origin).to.be.an('undefined');
          expect(urlo.protocol).to.be.an('undefined');
          expect(urlo.protocolmark).to.be.an('undefined');
          expect(urlo.hostname).to.be.an('undefined');
          expect(urlo.port).to.be.an('undefined');
          expect(urlo.path).to.equal("./");
          expect(urlo.search).to.be.an('undefined');
          expect(urlo.hash).to.be.an('undefined');
        });

        it("with c: drive", function() {
          var urlo = File.parseUri("file:///c:/program files");
          expect(urlo.origin).to.be.an('undefined');
          expect(urlo.protocol).to.equal("file:");
          expect(urlo.protocolmark).to.equal("///");
          expect(urlo.hostname).to.be.an('undefined');
          expect(urlo.port).to.be.an('undefined');
          expect(urlo.path).to.equal("c:/program files");
          expect(urlo.search).to.be.an('undefined');
          expect(urlo.hash).to.be.an('undefined');
        });

        it("with c: drive and path", function() {
          var urlo = File.parseUri("file:///c:/program files/mortarjs");
          expect(urlo.origin).to.be.an('undefined');
          expect(urlo.protocol).to.equal("file:");
          expect(urlo.protocolmark).to.equal("///");
          expect(urlo.hostname).to.be.an('undefined');
          expect(urlo.port).to.be.an('undefined');
          expect(urlo.path).to.equal("c:/program files/mortarjs");
          expect(urlo.search).to.be.an('undefined');
          expect(urlo.hash).to.be.an('undefined');
        });

        it("with with no drive letter and path", function() {
          var urlo = File.parseUri("file:////program files/mortarjs");
          expect(urlo.origin).to.be.an('undefined');
          expect(urlo.protocol).to.equal("file:");
          expect(urlo.protocolmark).to.equal("///");
          expect(urlo.hostname).to.be.an('undefined');
          expect(urlo.port).to.be.an('undefined');
          expect(urlo.path).to.equal("/program files/mortarjs");
          expect(urlo.search).to.be.an('undefined');
          expect(urlo.hash).to.be.an('undefined');
        });

        it("with with no drive letter and path starting with a single dot", function() {
          var urlo = File.parseUri("file:///./program files/mortarjs");
          expect(urlo.origin).to.be.an('undefined');
          expect(urlo.protocol).to.equal("file:");
          expect(urlo.protocolmark).to.equal("///");
          expect(urlo.hostname).to.be.an('undefined');
          expect(urlo.port).to.be.an('undefined');
          expect(urlo.path).to.equal("./program files/mortarjs");
          expect(urlo.search).to.be.an('undefined');
          expect(urlo.hash).to.be.an('undefined');
        });

        it("with with no drive letter with back slashes in the path starting with a single leading dot", function() {
          var urlo = File.parseUri("file:///.\\program files\\mortarjs");
          expect(urlo.origin).to.be.an('undefined');
          expect(urlo.protocol).to.equal("file:");
          expect(urlo.protocolmark).to.equal("///");
          expect(urlo.hostname).to.be.an('undefined');
          expect(urlo.port).to.be.an('undefined');
          expect(urlo.path).to.equal("./program files/mortarjs");
          expect(urlo.search).to.be.an('undefined');
          expect(urlo.hash).to.be.an('undefined');
        });

        it("with with no drive letter with back slashes in the path starting with a two leading dot", function() {
          var urlo = File.parseUri("file:///..\\program files\\mortarjs");
          expect(urlo.origin).to.be.an('undefined');
          expect(urlo.protocol).to.equal("file:");
          expect(urlo.protocolmark).to.equal("///");
          expect(urlo.hostname).to.be.an('undefined');
          expect(urlo.port).to.be.an('undefined');
          expect(urlo.path).to.equal("../program files/mortarjs");
          expect(urlo.search).to.be.an('undefined');
          expect(urlo.hash).to.be.an('undefined');
        });

        it("leading forward slash", function() {
          var urlo = File.parseUri("/program files/mortarjs");
          expect(urlo.origin).to.be.an('undefined');
          expect(urlo.protocol).to.be.an('undefined');
          expect(urlo.protocolmark).to.be.an('undefined');
          expect(urlo.hostname).to.be.an('undefined');
          expect(urlo.port).to.be.an('undefined');
          expect(urlo.path).to.equal("/program files/mortarjs");
          expect(urlo.search).to.be.an('undefined');
          expect(urlo.hash).to.be.an('undefined');
        });

        it("leading back slash", function() {
          var urlo = File.parseUri("\\program files/mortarjs");
          expect(urlo.origin).to.be.an('undefined');
          expect(urlo.protocol).to.be.an('undefined');
          expect(urlo.protocolmark).to.be.an('undefined');
          expect(urlo.hostname).to.be.an('undefined');
          expect(urlo.port).to.be.an('undefined');
          expect(urlo.path).to.equal("/program files/mortarjs");
          expect(urlo.search).to.be.an('undefined');
          expect(urlo.hash).to.be.an('undefined');
        });

        it("mixed slashes", function() {
          var urlo = File.parseUri("\\/program files//\\/mortarjs");
          expect(urlo.origin).to.be.an('undefined');
          expect(urlo.protocol).to.be.an('undefined');
          expect(urlo.protocolmark).to.be.an('undefined');
          expect(urlo.hostname).to.be.an('undefined');
          expect(urlo.port).to.be.an('undefined');
          expect(urlo.path).to.equal("/program files/mortarjs");
          expect(urlo.search).to.be.an('undefined');
          expect(urlo.hash).to.be.an('undefined');
        });

        it("leading dot with forward slash", function() {
          var urlo = File.parseUri("./program files/mortarjs");
          expect(urlo.origin).to.be.an('undefined');
          expect(urlo.protocol).to.be.an('undefined');
          expect(urlo.protocolmark).to.be.an('undefined');
          expect(urlo.hostname).to.be.an('undefined');
          expect(urlo.port).to.be.an('undefined');
          expect(urlo.path).to.equal("./program files/mortarjs");
          expect(urlo.search).to.be.an('undefined');
          expect(urlo.hash).to.be.an('undefined');
        });

        it("two leading dots with forward slash", function() {
          var urlo = File.parseUri("../program files/mortarjs");
          expect(urlo.origin).to.be.an('undefined');
          expect(urlo.protocol).to.be.an('undefined');
          expect(urlo.protocolmark).to.be.an('undefined');
          expect(urlo.hostname).to.be.an('undefined');
          expect(urlo.port).to.be.an('undefined');
          expect(urlo.path).to.equal("../program files/mortarjs");
          expect(urlo.search).to.be.an('undefined');
          expect(urlo.hash).to.be.an('undefined');
        });

        it("two leading dots with back slash", function() {
          var urlo = File.parseUri("..\\program files/mortarjs");
          expect(urlo.origin).to.be.an('undefined');
          expect(urlo.protocol).to.be.an('undefined');
          expect(urlo.protocolmark).to.be.an('undefined');
          expect(urlo.hostname).to.be.an('undefined');
          expect(urlo.port).to.be.an('undefined');
          expect(urlo.path).to.equal("../program files/mortarjs");
          expect(urlo.search).to.be.an('undefined');
          expect(urlo.hash).to.be.an('undefined');
        });
      });
    });


    describe("normalize", function() {
      it("2 leading forward  slashes", function() {
        expect(File.normalize("//test")).to.equal("/test");
      });

      it("2 leading back slashes", function() {
        expect(File.normalize("\\\\test")).to.equal("/test");
      });

      it("2 ending forward slashes", function() {
        expect(File.normalize("test//")).to.equal("test/");
      });

      it("2 ending back slashes", function() {
        expect(File.normalize("test\\\\")).to.equal("test/");
      });

      it("2 leading and 2 middle forward slashes", function() {
        expect(File.normalize("//test//this")).to.equal("/test/this");
      });

      it("2 leading, 2 middle, and 2 ending forward slashes", function() {
        expect(File.normalize("//test//this//")).to.equal("/test/this/");
      });

      it("Just mixed", function() {
        expect(File.normalize("//test//\\\\///this\\//")).to.equal("/test/this/");
      });

      it("2 dots", function() {
        expect(File.normalize("/test1//test2/../this/")).to.equal("/test1/this/");
      });

      it("leading slash and a couple of 2 dots", function() {
        expect(File.normalize("/test1//../../../../this/")).to.equal("/this/");
      });

      it("leading . and a couple of 2 dots", function() {
        expect(File.normalize("./test1/test2/../test3/../../../../this/")).to.equal("./this/");
      });

      it("Just 1 dot", function() {
        expect(File.normalize(".")).to.equal(".");
      });
    });


    describe("hasProtocol", function() {
      it("Path with forward slash", function() {
        expect(File.hasProtocol("/test")).to.equal(true);
      });

      it("Leading back slash", function() {
        expect(File.hasProtocol("\\test")).to.equal(true);
      });

      it("Path with leading dot", function() {
        expect(File.hasProtocol("./test")).to.equal(true);
      });

      it("Path with 2 leading dot", function() {
        expect(File.hasProtocol("..\\test")).to.equal(true);
      });

      it("Path with no leading slash or dot", function() {
        expect(File.hasProtocol("test")).to.equal(true);
      });

      it("Path with leading http protocol", function() {
        expect(File.hasProtocol("http://")).to.equal(false);
      });

      it("Path with leading https protocol", function() {
        expect(File.hasProtocol("https://")).to.equal(false);
      });

      it("Path with leading file protocol", function() {
        expect(File.hasProtocol("file:///")).to.equal(false);
      });
    });

  });

});
