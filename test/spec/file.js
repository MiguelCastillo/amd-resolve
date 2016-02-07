var Resolver = require("dist/amd-resolver");
var file = Resolver.file;

describe("File Test Suite", function() {
  describe("when calling parseParts", function() {
    describe("with a simple file path", function() {
      var fileName = file.parseParts("/mortarjs.html");

      it("then the file name is `mortarjs.html`", function() {
        expect(fileName.name).to.equal("mortarjs.html");
      });

      it("then the file directory is `/`", function() {
        expect(fileName.directory).to.equal("/");
      });
    });

    describe("with a leading dot directory", function() {
      var fileName = file.parseParts("./mortarjs.html");

      it("then the file name is `mortarjs.html`", function() {
        expect(fileName.name).to.equal("mortarjs.html");
      });

      it("then the file directory is `./`", function() {
        expect(fileName.directory).to.equal("./");
      });
    });

    describe("with just a file", function() {
      var fileName = file.parseParts("mortarjs.html");

      it("then the file name is `mortarjs.html`", function() {
        expect(fileName.name).to.equal("mortarjs.html");
      });

      it("then the file directory is an empty string", function() {
        expect(fileName.directory).to.equal("");
      });
    });

    describe("with a leading dot file", function() {
      var fileName = file.parseParts(".mortarjs.html");
      it("then the file name is `.mortarjs.html`", function() {
        expect(fileName.name).to.equal(".mortarjs.html");
      });

      it("then the file directory is an empty string", function() {
        expect(fileName.directory).to.equal("");
      });
    });

    describe("with a deep path file", function() {
      var fileName = file.parseParts("/this/is/a/looong/path/to/the/file/mortarjs.html");
      it("then the file name is equal to `mortarjs.html`", function() {
        expect(fileName.name).to.equal("mortarjs.html");
      });

      it("then the file directory is `/this/is/a/looong/path/to/the/file/`", function() {
        expect(fileName.directory).to.equal("/this/is/a/looong/path/to/the/file/");
      });
    });

    describe("with a deep path and leading dot file", function() {
      var fileName = file.parseParts("/this/is/a/looong/path/to/the/file/.mortarjs.html");

      it("then the file name is equal to `.mortarjs.html`", function() {
        expect(fileName.name).to.equal(".mortarjs.html");
      });

      it("then the file directory is equal to `/this/is/a/looong/path/to/the/file/`", function() {
        expect(fileName.directory).to.equal("/this/is/a/looong/path/to/the/file/");
      });
    });
  });


  describe("when calling addExtension", function() {
    describe("when adding extension to file with existing extension", function() {
      it("then `test/file.html` is `test/file.html`", function() {
        var fileString = file.addExtension("test/file.html", "js");
        expect(fileString).to.equal("test/file.html");
      });

      it("then `test/file.ext1.html` is `test/file.ext1.html`", function() {
        var fileString = file.addExtension("test/file.ext1.html", "js");
        expect(fileString).to.equal("test/file.ext1.html");
      });

      it("then `test/.file.ext1.html` is `test/.file.ext1.html`", function() {
        var fileString = file.addExtension("test/.file.ext1.html", "js");
        expect(fileString).to.equal("test/.file.ext1.html");
      });
    });

    describe("when adding extension to file without existing extension", function() {
      it("then `test/file` is `test/file.js", function() {
        var fileString = file.addExtension("test/file", "js");
        expect(fileString).to.equal("test/file.js");
      });
    });
  });


  describe("when calling replaceExtension", function() {
    describe("when replacing extension in file path with existing extension", function() {
      it("then `test/file.html` is `test/file.js`", function() {
        var fileString = file.replaceExtension("test/file.html", "js");
        expect(fileString).to.equal("test/file.js");
      });

      it("then `test/file.ext1.html` is `test/file.ext1.js`", function() {
        var fileString = file.replaceExtension("test/file.ext1.html", "js");
        expect(fileString).to.equal("test/file.ext1.js");
      });

      it("then `test/.file.ext1.html` is `test/.file.ext1.js`", function() {
        var fileString = file.replaceExtension("test/.file.ext1.html", "js");
        expect(fileString).to.equal("test/.file.ext1.js");
      });

      it("then `test/.test/.file.ext1.html` is `test/.test/.file.ext1.js`", function() {
        var fileString = file.replaceExtension("test/.test/.file.ext1.html", "js");
        expect(fileString).to.equal("test/.test/.file.ext1.js");
      });
    });

    describe("when replacing extension in file paths without existing extension", function() {
      it("then `test/file` is `test/file.js", function() {
        var fileString = file.replaceExtension("test/file", "js");
        expect(fileString).to.equal("test/file.js");
      });

      it("then `test/.file` is `test/.file.js", function() {
        var fileString = file.replaceExtension("test/.file", "js");
        expect(fileString).to.equal("test/.file.js");
      });

      it("then `test/.test/.file` is `test/.test/.file`", function() {
        var fileString = file.replaceExtension("test/.test/.file", "js");
        expect(fileString).to.equal("test/.test/.file.js");
      });
    });
  });


  describe("when getting the extension from a file", function() {
    describe("and getting the extension from `file.js`", function() {
      it("then `js` is returned", function() {
        expect(file.getExtension("file.js")).to.equal("js");
      });
    });

    describe("and getting the extension from `/.file.js`", function() {
      it("then `js` is returned", function() {
        expect(file.getExtension("/.file.js")).to.equal("js");
      });
    });

    describe("and getting the extension from `.file.js`", function() {
      it("then `js` is returned", function() {
        expect(file.getExtension(".file.js")).to.equal("js");
      });
    });

    describe("and getting the extension from `.file.js.txt.executable.binary`", function() {
      it("then `js` is returned", function() {
        expect(file.getExtension(".file.js.txt.executable.binary")).to.equal("binary");
      });
    });

    describe("and getting the extension from a file without extension", function() {
      it("then empty string is returned", function() {
        expect(file.getExtension("file")).to.equal("");
      });
    });

    describe("and getting the extension from `/.file`", function() {
      it("then no extension is returned", function() {
        expect(file.getExtension(".file")).to.equal("");
      });
    });

    describe("and getting the extension from `.file`", function() {
      it("then no extension is returned", function() {
        expect(file.getExtension(".file")).to.equal("");
      });
    });
  });
});
