define(["dist/amd-resolver"], function(Resolver) {
  var File = Resolver.File;

  describe("File", function() {
    describe("when creating an instance", function() {
      describe("with a simple path, and no base", function() {
        var file = new File("/path", "");

        it("then the protocol will be undefined", function() {
          expect(file.protocol).to.be.an('undefined');
        });

        it("then the file name is `path`", function() {
          expect(file.name).to.equal("path");
        });

        it("then the file path is `/`", function() {
          expect(file.path).to.equal("/");
        });
      });

      describe("with a simple path and a simple base", function() {
        var file = new File("path", "baseuri");

        it("then the protocol with be undefined", function() {
          expect(file.protocol).to.be.an('undefined');
        });

        it("then the file name is `path`", function() {
          expect(file.name).to.equal("path");
        });

        it("then the file path is `baseuri/`", function() {
          expect(file.path).to.equal("baseuri/");
        });
      });

      describe("with a module with leading double dot and a longer base", function() {
        var file = new File("../module1", "baseuri/path1/path2");

        it("then the protocol will be undefined", function() {
          expect(file.protocol).to.be.an('undefined');
        });

        it("then the file name is `module1`", function() {
          expect(file.name).to.equal("module1");
        });

        it("then the file path is `baseuri/path1/`", function() {
          expect(file.path).to.equal("baseuri/path1/");
        });
      });
    });


    describe("when calling parseFileName", function() {
      describe("with a simple file path", function() {
        var fileName = File.parseFileName("/mortarjs.html");

        it("then the file name is `mortarjs.html`", function() {
          expect(fileName.name).to.equal("mortarjs.html");
        });

        it("then the file path is `/`", function() {
          expect(fileName.path).to.equal("/");
        });
      });

      describe("with a leading dot directory", function() {
        var fileName = File.parseFileName("./mortarjs.html");

        it("then the file name is `mortarjs.html`", function() {
          expect(fileName.name).to.equal("mortarjs.html");
        });

        it("then the file path is `./`", function() {
          expect(fileName.path).to.equal("./");
        });
      });

      describe("with just a file", function() {
        var fileName = File.parseFileName("mortarjs.html");

        it("then the file name is `mortarjs.html`", function() {
          expect(fileName.name).to.equal("mortarjs.html");
        });

        it("then the file path is an empty string", function() {
          expect(fileName.path).to.equal("");
        });
      });

      describe("with a leading dot file", function() {
        var fileName = File.parseFileName(".mortarjs.html");
        it("then the file name is `.mortarjs.html`", function() {
          expect(fileName.name).to.equal(".mortarjs.html");
        });

        it("then the file path is an empty string", function() {
          expect(fileName.path).to.equal("");
        });
      });

      describe("with a deep path file", function() {
        var fileName = File.parseFileName("/this/is/a/looong/path/to/the/file/mortarjs.html");
        it("then the file name is equal to `mortarjs.html`", function() {
          expect(fileName.name).to.equal("mortarjs.html");
        });

        it("then the file path is `/this/is/a/looong/path/to/the/file/`", function() {
          expect(fileName.path).to.equal("/this/is/a/looong/path/to/the/file/");
        });
      });

      describe("with a deep path and leading dot file", function() {
        var fileName = File.parseFileName("/this/is/a/looong/path/to/the/file/.mortarjs.html");

        it("then the file name is equal to `.mortarjs.html`", function() {
          expect(fileName.name).to.equal(".mortarjs.html");
        });

        it("then the file path is equal to `/this/is/a/looong/path/to/the/file/`", function() {
          expect(fileName.path).to.equal("/this/is/a/looong/path/to/the/file/");
        });
      });
    });


    describe("when calling addExtension", function() {
      describe("when adding extension to file with existing extension", function() {
        it("then `test/file.html` is `test/file.html`", function() {
          var fileString = File.addExtension("test/file.html", "js");
          expect(fileString).to.equal("test/file.html");
        });

        it("then `test/file.ext1.html` is `test/file.ext1.html`", function() {
          var fileString = File.addExtension("test/file.ext1.html", "js");
          expect(fileString).to.equal("test/file.ext1.html");
        });

        it("then `test/.file.ext1.html` is `test/.file.ext1.html`", function() {
          var fileString = File.addExtension("test/.file.ext1.html", "js");
          expect(fileString).to.equal("test/.file.ext1.html");
        });
      });

      describe("when adding extension to file without existing extension", function() {
        it("then `test/file` is `test/file.js", function() {
          var fileString = File.addExtension("test/file", "js");
          expect(fileString).to.equal("test/file.js");
        });
      });
    });


    describe("when calling replaceExtension", function() {
      describe("when replacing extension in file path with existing extension", function() {
        it("then `test/file.html` is `test/file.js`", function() {
          var fileString = File.replaceExtension("test/file.html", "js");
          expect(fileString).to.equal("test/file.js");
        });

        it("then `test/file.ext1.html` is `test/file.ext1.js`", function() {
          var fileString = File.replaceExtension("test/file.ext1.html", "js");
          expect(fileString).to.equal("test/file.ext1.js");
        });

        it("then `test/.file.ext1.html` is `test/.file.ext1.js`", function() {
          var fileString = File.replaceExtension("test/.file.ext1.html", "js");
          expect(fileString).to.equal("test/.file.ext1.js");
        });

        it("then `test/.test/.file.ext1.html` is `test/.test/.file.ext1.js`", function() {
          var fileString = File.replaceExtension("test/.test/.file.ext1.html", "js");
          expect(fileString).to.equal("test/.test/.file.ext1.js");
        });
      });

      describe("when replacing extension in file paths without existing extension", function() {
        it("then `test/file` is `test/file.js", function() {
          var fileString = File.replaceExtension("test/file", "js");
          expect(fileString).to.equal("test/file.js");
        });

        it("then `test/.file` is `test/.file.js", function() {
          var fileString = File.replaceExtension("test/.file", "js");
          expect(fileString).to.equal("test/.file.js");
        });

        it("then `test/.test/.file` is `test/.test/.file`", function() {
          var fileString = File.replaceExtension("test/.test/.file", "js");
          expect(fileString).to.equal("test/.test/.file.js");
        });
      });
    });


    describe("when calling mergePaths", function() {
      describe("with no path and a simple base", function() {
        var path = File.mergePaths("", "/path");

        it("then the path is `/path`", function() {
          expect(path).to.equal("/path");
        });
      });

      describe("with a simple path", function() {
        describe("and no base", function() {
          var path = File.mergePaths("/path");

          it("then the path is `/path`", function() {
            expect(path).to.equal("/path");
          });
        });

        describe("and an empty base", function() {
          var path = File.mergePaths("/path", "");

          it("then the path is `/path`", function() {
            expect(path).to.equal("/path");
          });
        });

        describe("and a simple base", function() {
          var path = File.mergePaths("/path", "/");

          it("then the path is `/path`", function() {
            expect(path).to.equal("/path");
          });
        });

        describe("and a dotted base path", function() {
          var path = File.mergePaths("/path", "../../test1/test2");

          it("then the path is `/path`", function() {
            expect(path).to.equal("/path");
          });
        });
      });

      describe("with a relative path and a simple base", function() {
        var path = File.mergePaths("./path", "/");

        it("then the path is `/path`", function() {
          expect(path).to.equal("/path");
        });
      });

      describe("with a dotted path", function () {
        describe("and a simple base", function() {
          var path = File.mergePaths("../path", "/");

          it("then the path is `/path`", function() {
            expect(path).to.equal("/path");
          });
        });

        describe("and a single dot base", function() {
          var path = File.mergePaths("../path", "./");

          it("then the path is `/path`", function() {
            expect(path).to.equal("/path");
          });
        });

        describe("and a simple base", function() {
          var path = File.mergePaths("../../../path", "/");
          expect(path).to.equal("/path");
        });

        describe("and a single dot base", function() {
          var path = File.mergePaths("../../../path", "./");

          it("then the path is `/path`", function() {
            expect(path).to.equal("/path");
          });
        });

        describe("and a complex base containing spaces", function() {
          var path = File.mergePaths("../path", "/container/of my/child");

          it("then the path is `/container/of my/path`", function() {
            expect(path).to.equal("/container/of my/path");
          });
        });

        describe("and a complex base containing spaces", function() {
          var path = File.mergePaths("../../../path", "/container/of my/child/part1/part2/part3");

          it("then the path is `/container/of my/child/path`", function () {
            expect(path).to.equal("/container/of my/child/path");
          });
        });

        describe("and a complex dotted base containing spaces", function() {
          var path = File.mergePaths("../../../path", "./container/of my/child/part1/part2/part3");

          it("then the path is `./container/of my/child/path`", function() {
            expect(path).to.equal("./container/of my/child/path");
          });
        });
      });
    });


    describe("when calling parseUri", function() {
      describe("using HTTP protocol", function() {
        describe("and a simple url", function() {
          describe("for `http://hoistedjs.com`", function() {
            var parsedURI = File.parseUri("http://hoistedjs.com");

            it("origin should equal `http://hoistedjs.com`", function() {
              expect(parsedURI.origin).to.equal("http://hoistedjs.com");
            });

            it("protocol should equal `http:`", function() {
              expect(parsedURI.protocol).to.equal("http:");
            });

            it("protocolmark should equal `//`", function() {
              expect(parsedURI.protocolmark).to.equal("//");
            });

            it("hostname should equal `hoistedjs.com`", function() {
              expect(parsedURI.hostname).to.equal("hoistedjs.com");
            });

            it("port should equal undefined", function() {
              expect(parsedURI.port).to.be.an('undefined');
            });

            it("path should equal undefined", function() {
              expect(parsedURI.path).to.be.an('undefined');
            });

            it("search should equal undefined", function() {
              expect(parsedURI.search).to.be.an('undefined');
            });

            it("hash should equal undefined", function() {
              expect(parsedURI.hash).to.be.an('undefined');
            });
          });

          describe("with a hash", function () {
            describe("for `http://hoistedjs.com#migration/topic/data`", function() {
              var parsedURI = File.parseUri("http://hoistedjs.com#migration/topic/data");

              it("origin should equal `http://hoistedjs.com`", function() {
                expect(parsedURI.origin).to.equal("http://hoistedjs.com");
              });

              it("protocol should equal `http:`", function() {
                expect(parsedURI.protocol).to.equal("http:");
              });

              it("protocolmark should equal `//`", function() {
                expect(parsedURI.protocolmark).to.equal("//");
              });

              it("hostname should equal `hoistedjs.com`", function() {
                expect(parsedURI.hostname).to.equal("hoistedjs.com");
              });

              it("port should be undefined", function() {
                expect(parsedURI.port).to.be.an('undefined');
              });

              it("path should be undefined", function() {
                expect(parsedURI.path).to.be.an('undefined');
              });

              it("search should be undefined", function() {
                expect(parsedURI.search).to.be.an('undefined');
              });

              it("hash should equal `#migration/topic/data`", function() {
                expect(parsedURI.hash).to.equal("#migration/topic/data");
              });
            });
          });

          describe("with a search string", function() {
            describe("for `http://hoistedjs.com?topic=data`", function() {
              var parsedURI = File.parseUri("http://hoistedjs.com?topic=data");

              it("origin should equal `http://hoistedjs.com`", function() {
                expect(parsedURI.origin).to.equal("http://hoistedjs.com");
              });

              it("protocol should equal `http:`", function() {
                expect(parsedURI.protocol).to.equal("http:");
              });

              it("protocolmark should equal `//`", function() {
                expect(parsedURI.protocolmark).to.equal("//");
              });

              it("hostname should equal `hoistedjs.com`", function() {
                expect(parsedURI.hostname).to.equal("hoistedjs.com");
              });

              it("port should be undefined", function() {
                expect(parsedURI.port).to.be.an('undefined');
              });

              it("path should be undefined", function() {
                expect(parsedURI.path).to.be.an('undefined');
              });

              it("search should equal `?topic=data`", function() {
                expect(parsedURI.search).to.equal("?topic=data");
              });

              it("hash should be undefined", function() {
                expect(parsedURI.hash).to.be.an('undefined');
              });
            });

            describe("and a hash", function() {
              describe("for `http://hoistedjs.com?topic=data#migration/path`", function() {
                var parsedURI = File.parseUri("http://hoistedjs.com?topic=data#migration/path");

                it("origin should equal `http://hoistedjs.com`", function() {
                  expect(parsedURI.origin).to.equal("http://hoistedjs.com");
                });

                it("protocol should equal `http:`", function() {
                  expect(parsedURI.protocol).to.equal("http:");
                });

                it("protocolmark should equal `//`", function() {
                  expect(parsedURI.protocolmark).to.equal("//");
                });

                it("hostname should equal `hoistedjs.com`", function() {
                  expect(parsedURI.hostname).to.equal("hoistedjs.com");
                });

                it("port should be undefined", function() {
                  expect(parsedURI.port).to.be.an('undefined');
                });

                it("path should be undefined", function() {
                  expect(parsedURI.path).to.be.an('undefined');
                });

                it("search should equal `?topic=data`", function() {
                  expect(parsedURI.search).to.equal("?topic=data");
                });

                it("hash should equal `#migration/path`", function() {
                  expect(parsedURI.hash).to.equal("#migration/path");
                });
              });

              describe("and an empty path", function() {
                describe("for `http://hoistedjs.com/?topic=data#migration/path`", function() {
                  var parsedURI = File.parseUri("http://hoistedjs.com/?topic=data#migration/path");

                  it("origin should equal `http://hoistedjs.com`", function() {
                    expect(parsedURI.origin).to.equal("http://hoistedjs.com");
                  });

                  it("protocol should equal `http:`", function() {
                    expect(parsedURI.protocol).to.equal("http:");
                  });

                  it("protocolmark should equal `//`", function() {
                    expect(parsedURI.protocolmark).to.equal("//");
                  });

                  it("hostname should equal `hoistedjs.com`", function() {
                    expect(parsedURI.hostname).to.equal("hoistedjs.com");
                  });

                  it("port should be undefined", function() {
                    expect(parsedURI.port).to.be.an('undefined');
                  });

                  it("path should equal `/`", function() {
                    expect(parsedURI.path).to.equal("/");
                  });

                  it("search should equal `?topic=data`", function() {
                    expect(parsedURI.search).to.equal("?topic=data");
                  });

                  it("hash should equal `#migration/path`", function() {
                    expect(parsedURI.hash).to.equal("#migration/path");
                  });
                });
              });

              describe("and a simple path", function() {
                describe("for `http://hoistedjs.com/moretesting?topic=data#migration/path`", function() {
                  var parsedURI = File.parseUri("http://hoistedjs.com/moretesting?topic=data#migration/path");

                  it("origin should equal `http://hoistedjs.com`", function() {
                    expect(parsedURI.origin).to.equal("http://hoistedjs.com");
                  });

                  it("protocol should equal `http:`", function() {
                    expect(parsedURI.protocol).to.equal("http:");
                  });

                  it("protocolmark should equal `//`", function() {
                    expect(parsedURI.protocolmark).to.equal("//");
                  });

                  it("hostname should equal `hoistedjs.com`", function() {
                    expect(parsedURI.hostname).to.equal("hoistedjs.com");
                  });

                  it("port should be undefined", function() {
                    expect(parsedURI.port).to.be.an('undefined');
                  });

                  it("path should equal `/moretesting/`", function() {
                    expect(parsedURI.path).to.equal("/moretesting");
                  });

                  it("search should equal `?topic=data`", function() {
                    expect(parsedURI.search).to.equal("?topic=data");
                  });

                  it("hash should equal `#migration/path`", function() {
                    expect(parsedURI.hash).to.equal("#migration/path");
                  });
                });

                describe("with a port", function() {
                  describe("for `http://hoistedjs.com:599/moretesting?topic=data#migration/path`", function() {
                    var parsedURI = File.parseUri("http://hoistedjs.com:599/moretesting?topic=data#migration/path");

                    it("origin should equal `http://hoistedjs.com:599`", function() {
                      expect(parsedURI.origin).to.equal("http://hoistedjs.com:599");
                    });

                    it("protocol should equal `http:`", function() {
                      expect(parsedURI.protocol).to.equal("http:");
                    });

                    it("protocolmark should equal `//`", function() {
                      expect(parsedURI.protocolmark).to.equal("//");
                    });

                    it("hostname should equal `hoistedjs.com`", function() {
                      expect(parsedURI.hostname).to.equal("hoistedjs.com");
                    });

                    it("port should equal `599`", function() {
                      expect(parsedURI.port).to.equal('599');
                    });

                    it("path should equal `/moretesting`", function() {
                      expect(parsedURI.path).to.equal("/moretesting");
                    });

                    it("search should equal `?topic=data`", function() {
                      expect(parsedURI.search).to.equal("?topic=data");
                    });

                    it("hash should equal `#migration/path`", function() {
                      expect(parsedURI.hash).to.equal("#migration/path");
                    });
                  });
                });
              });
            });
          });
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


    describe("when calling normalize", function() {
      it("2 leading forward slashes", function() {
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


    describe("when calling hasProtocol", function() {
      it("a path with a forward slash should have a protocol", function() {
        expect(File.hasProtocol("/test")).to.equal(true);
      });

      it("a path with a leading back slash should have a protocol", function() {
        expect(File.hasProtocol("\\test")).to.equal(true);
      });

      it("a path with a leading dot should have a protocol", function() {
        expect(File.hasProtocol("./test")).to.equal(true);
      });

      it("a path with 2 leading dots should have a protocol", function() {
        expect(File.hasProtocol("..\\test")).to.equal(true);
      });

      it("a path with no leading slash or dot should have a protocol", function() {
        expect(File.hasProtocol("test")).to.equal(true);
      });

      it("a path with a leading http protocol should not have a protocol", function() {
        expect(File.hasProtocol("http://")).to.equal(false);
      });

      it("a path with leading https protocol should not have a protocol", function() {
        expect(File.hasProtocol("https://")).to.equal(false);
      });

      it("a path with leading file protocol should not have a protocol", function() {
        expect(File.hasProtocol("file:///")).to.equal(false);
      });
    });
  });
});
