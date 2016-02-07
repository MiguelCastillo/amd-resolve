var Resolver = require("dist/amd-resolver");
var Url = Resolver.Url;

describe("URL Test Suite", function() {
  describe("When creating a URL with ''", function() {
    var url = new Url('');

    it("then `hash` is an empty string", function() {
      expect(url.hash).to.equal('');
    });

    it("then `host` is an empty string", function() {
      expect(url.host).to.equal('');
    });

    it("then `hostname` is an empty string", function() {
      expect(url.hostname).to.equal('');
    });

    it("then `href` is an empty string", function() {
      expect(url.href).to.equal('');
    });

    it("then `origin` is an empty string", function() {
      expect(url.origin).to.equal('');
    });

    it("then `password` is an empty string", function() {
      expect(url.password).to.equal('');
    });

    it("then `pathname` is an empty string", function() {
      expect(url.pathname).to.equal('');
    });

    it("then `port` is an empty string", function() {
      expect(url.port).to.equal('');
    });

    it("then `protocol` is an empty string", function() {
      expect(url.protocol).to.equal('');
    });

    it("then `search` is an empty string", function() {
      expect(url.search).to.equal('');
    });

    it("then `username` is an empty string", function() {
      expect(url.username).to.equal('');
    });
  });

  describe("When creating a URL with `https://developer.mozilla.org`", function() {
    var url = new Url("https://developer.mozilla.org");

    it("then `hash` is an empty string", function() {
      expect(url.hash).to.equal('');
    });

    it("then `host` is `developer.mozilla.org`", function() {
      expect(url.host).to.equal("developer.mozilla.org");
    });

    it("then `hostname` is `developer.mozilla.org`", function() {
      expect(url.hostname).to.equal("developer.mozilla.org");
    });

    it("then `href` is `https://developer.mozilla.org/`", function() {
      expect(url.href).to.equal("https://developer.mozilla.org/");
    });

    it("then `origin` is `https://developer.mozilla.org`", function() {
      expect(url.origin).to.equal("https://developer.mozilla.org");
    });

    it("then `password` is an empty string", function() {
      expect(url.password).to.equal('');
    });

    it("then `pathname` is `/`", function() {
      expect(url.pathname).to.equal("/");
    });

    it("then `port` is an empty string", function() {
      expect(url.port).to.equal('');
    });

    it("then `protocol` is `https:`", function() {
      expect(url.protocol).to.equal("https:");
    });

    it("then `search` is an empty string", function() {
      expect(url.search).to.equal('');
    });

    it("then `username` is an empty string", function() {
      expect(url.username).to.equal('');
    });
  });


  describe("When creating a URL with `/` and base `https://developer.mozilla.org`", function() {
    var url = new Url("/", "https://developer.mozilla.org");

    it("then `hash` is an empty string", function() {
      expect(url.hash).to.equal('');
    });

    it("then `host` is `developer.mozilla.org`", function() {
      expect(url.host).to.equal("developer.mozilla.org");
    });

    it("then `hostname` is `developer.mozilla.org`", function() {
      expect(url.hostname).to.equal("developer.mozilla.org");
    });

    it("then `href` is `https://developer.mozilla.org/`", function() {
      expect(url.href).to.equal("https://developer.mozilla.org/");
    });

    it("then `origin` is `https://developer.mozilla.org`", function() {
      expect(url.origin).to.equal("https://developer.mozilla.org");
    });

    it("then `password` is an empty string", function() {
      expect(url.password).to.equal('');
    });

    it("then `pathname` is `/`", function() {
      expect(url.pathname).to.equal("/");
    });

    it("then `port` is an empty string", function() {
      expect(url.port).to.equal('');
    });

    it("then `protocol` is `https:`", function() {
      expect(url.protocol).to.equal("https:");
    });

    it("then `search` is an empty string", function() {
      expect(url.search).to.equal('');
    });

    it("then `username` is an empty string", function() {
      expect(url.username).to.equal('');
    });
  });


  describe("When creating a URL with `en-US/docs` and base `https://developer.mozilla.org`", function() {
    var url = new Url("en-US/docs", "https://developer.mozilla.org");

    it("then `hash` is an empty string", function() {
      expect(url.hash).to.equal('');
    });

    it("then `host` is `developer.mozilla.org`", function() {
      expect(url.host).to.equal("developer.mozilla.org");
    });

    it("then `hostname` is `developer.mozilla.org`", function() {
      expect(url.hostname).to.equal("developer.mozilla.org");
    });

    it("then `href` is `https://developer.mozilla.org/en-US/docs`", function() {
      expect(url.href).to.equal("https://developer.mozilla.org/en-US/docs");
    });

    it("then `origin` is `https://developer.mozilla.org`", function() {
      expect(url.origin).to.equal("https://developer.mozilla.org");
    });

    it("then `password` is an empty string", function() {
      expect(url.password).to.equal('');
    });

    it("then `pathname` is `/en-US/docs`", function() {
      expect(url.pathname).to.equal("/en-US/docs");
    });

    it("then `port` is an empty string", function() {
      expect(url.port).to.equal('');
    });

    it("then `protocol` is `https:`", function() {
      expect(url.protocol).to.equal("https:");
    });

    it("then `search` is an empty string", function() {
      expect(url.search).to.equal('');
    });

    it("then `username` is an empty string", function() {
      expect(url.username).to.equal('');
    });
  });


  describe("When creating a URL with `/en-US/docs` and base `https://developer.mozilla.org`", function() {
    var url = new Url("/en-US/docs", "https://developer.mozilla.org");

    it("then `hash` is an empty string", function() {
      expect(url.hash).to.equal('');
    });

    it("then `host` is `developer.mozilla.org`", function() {
      expect(url.host).to.equal("developer.mozilla.org");
    });

    it("then `hostname` is `developer.mozilla.org`", function() {
      expect(url.hostname).to.equal("developer.mozilla.org");
    });

    it("then `href` is `https://developer.mozilla.org/en-US/docs`", function() {
      expect(url.href).to.equal("https://developer.mozilla.org/en-US/docs");
    });

    it("then `origin` is `https://developer.mozilla.org`", function() {
      expect(url.origin).to.equal("https://developer.mozilla.org");
    });

    it("then `password` is an empty string", function() {
      expect(url.password).to.equal('');
    });

    it("then `pathname` is `/en-US/docs`", function() {
      expect(url.pathname).to.equal("/en-US/docs");
    });

    it("then `port` is an empty string", function() {
      expect(url.port).to.equal('');
    });

    it("then `protocol` is `https:`", function() {
      expect(url.protocol).to.equal("https:");
    });

    it("then `search` is an empty string", function() {
      expect(url.search).to.equal('');
    });

    it("then `username` is an empty string", function() {
      expect(url.username).to.equal('');
    });
  });


  describe("When creating a URL with path './style/application.css' and baseUrl https://domain:8080/main.js", function() {
    var url;
    beforeEach(function() {
      url = new Url("./style/application.css", "https://domain:8080/main.js");
    });

    it("then `hash` is an empty string", function() {
      expect(url.hash).to.equal('');
    });

    it("then `host` is `domain:8080`", function() {
      expect(url.host).to.equal("domain:8080");
    });

    it("then `hostname` is `domain`", function() {
      expect(url.hostname).to.equal("domain");
    });

    it("then `href` is `https://domain:8080/style/application.css`", function() {
      expect(url.href).to.equal("https://domain:8080/style/application.css");
    });

    it("then `origin` is `https://domain:8080`", function() {
      expect(url.origin).to.equal("https://domain:8080");
    });

    it("then `password` is an empty string", function() {
      expect(url.password).to.equal('');
    });

    it("then `pathname` is `/style/application.css`", function() {
      expect(url.pathname).to.equal("/style/application.css");
    });

    it("then `port` is 8080", function() {
      expect(url.port).to.equal('8080');
    });

    it("then `protocol` is `https:`", function() {
      expect(url.protocol).to.equal("https:");
    });

    it("then `search` is an empty string", function() {
      expect(url.search).to.equal('');
    });

    it("then `username` is an empty string", function() {
      expect(url.username).to.equal('');
    });
  });

  describe("When calling resolve", function() {
    describe("with `../base/path` and baseUrl `http://localhost/some/path/`", function() {
      it("then resolve returns `http://localhost/some/base/path`", function() {
        expect(Url.parser.resolve("http://localhost/some/path/", "../base/path")).to.equal("http://localhost/some/base/path");
      });
    });

    describe("with `./path/application.css` and baseUrl `http://localhost:8080/main.js`", function() {
      it("then resolve returns `http://localhost:8080/path/application.css`", function() {
        expect(Url.parser.resolve("http://localhost:8080/main.js", "./path/application.css")).to.equal("http://localhost:8080/path/application.css");
      });
    });

    describe("with `../base/path` and baseUrl `http://localhost/some/path`", function() {
      it("then resolve returns `http://localhost/base/path`", function() {
        expect(Url.parser.resolve("http://localhost/some/path", "../base/path")).to.equal("http://localhost/base/path");
      });
    });
  });


  describe("when calling `new File`", function() {
    describe("using HTTP protocol", function() {
      describe("and a simple url", function() {
        describe("for `http://hoistedjs.com`", function() {
          var parsedURL = new Url("http://hoistedjs.com");

          it("origin equals `http://hoistedjs.com`", function() {
            expect(parsedURL.origin).to.equal("http://hoistedjs.com");
          });

          it("href equals `http://hoistedjs.com`", function() {
            expect(parsedURL.href).to.equal("http://hoistedjs.com/");
          });

          it("protocol equals `http:`", function() {
            expect(parsedURL.protocol).to.equal("http:");
          });

          it("hostname equals `hoistedjs.com`", function() {
            expect(parsedURL.hostname).to.equal("hoistedjs.com");
          });

          it("pathname equals `/`", function() {
            expect(parsedURL.pathname).to.equal('/');
          });
        });

        describe("with a hash", function () {
          describe("for `http://hoistedjs.com#migration/topic/data`", function() {
            var parsedURL = new Url("http://hoistedjs.com#migration/topic/data");

            it("origin equals `http://hoistedjs.com`", function() {
              expect(parsedURL.origin).to.equal("http://hoistedjs.com");
            });

            it("href equals `http://hoistedjs.com/#migration/topic/data`", function() {
              expect(parsedURL.href).to.equal("http://hoistedjs.com/#migration/topic/data");
            });

            it("protocol equals `http:`", function() {
              expect(parsedURL.protocol).to.equal("http:");
            });

            it("hostname equals `hoistedjs.com`", function() {
              expect(parsedURL.hostname).to.equal("hoistedjs.com");
            });

            it("pathname equals `/`", function() {
              expect(parsedURL.pathname).to.equal('/');
            });

            it("hash equals `#migration/topic/data`", function() {
              expect(parsedURL.hash).to.equal("#migration/topic/data");
            });
          });
        });

        describe("with a search string", function() {
          describe("for `http://hoistedjs.com?topic=data`", function() {
            var parsedURL = new Url("http://hoistedjs.com?topic=data");

            it("origin equals `http://hoistedjs.com`", function() {
              expect(parsedURL.origin).to.equal("http://hoistedjs.com");
            });

            it("href equals `http://hoistedjs.com/?topic=data`", function() {
              expect(parsedURL.href).to.equal("http://hoistedjs.com/?topic=data");
            });

            it("protocol equals `http:`", function() {
              expect(parsedURL.protocol).to.equal("http:");
            });

            it("hostname equals `hoistedjs.com`", function() {
              expect(parsedURL.hostname).to.equal("hoistedjs.com");
            });

            it("pathname equals `/`", function() {
              expect(parsedURL.pathname).to.equal('/');
            });

            it("search equals `?topic=data`", function() {
              expect(parsedURL.search).to.equal("?topic=data");
            });
          });

          describe("and a hash", function() {
            describe("for `http://hoistedjs.com?topic=data#migration/path`", function() {
              var parsedURL = new Url("http://hoistedjs.com?topic=data#migration/path");

              it("origin equals `http://hoistedjs.com`", function() {
                expect(parsedURL.origin).to.equal("http://hoistedjs.com");
              });

              it("origin equals `http://hoistedjs.com/?topic=data#migration/path`", function() {
                expect(parsedURL.href).to.equal("http://hoistedjs.com/?topic=data#migration/path");
              });

              it("protocol equals `http:`", function() {
                expect(parsedURL.protocol).to.equal("http:");
              });

              it("hostname equals `hoistedjs.com`", function() {
                expect(parsedURL.hostname).to.equal("hoistedjs.com");
              });

              it("pathname should be `/`", function() {
                expect(parsedURL.pathname).to.equal('/');
              });

              it("search equals `?topic=data`", function() {
                expect(parsedURL.search).to.equal("?topic=data");
              });

              it("hash equals `#migration/path`", function() {
                expect(parsedURL.hash).to.equal("#migration/path");
              });
            });

            describe("and an empty path", function() {
              describe("for `http://hoistedjs.com/?topic=data#migration/path`", function() {
                var parsedURL = new Url("http://hoistedjs.com/?topic=data#migration/path");

                it("origin equals `http://hoistedjs.com`", function() {
                  expect(parsedURL.origin).to.equal("http://hoistedjs.com");
                });

                it("href equals `http://hoistedjs.com/?topic=data#migration/path`", function() {
                  expect(parsedURL.href).to.equal("http://hoistedjs.com/?topic=data#migration/path");
                });

                it("protocol equals `http:`", function() {
                  expect(parsedURL.protocol).to.equal("http:");
                });

                it("hostname equals `hoistedjs.com`", function() {
                  expect(parsedURL.hostname).to.equal("hoistedjs.com");
                });

                it("pathname equals `/`", function() {
                  expect(parsedURL.pathname).to.equal("/");
                });

                it("search equals `?topic=data`", function() {
                  expect(parsedURL.search).to.equal("?topic=data");
                });

                it("hash equals `#migration/path`", function() {
                  expect(parsedURL.hash).to.equal("#migration/path");
                });
              });
            });

            describe("and a simple path", function() {
              describe("for `http://hoistedjs.com/moretesting?topic=data#migration/path`", function() {
                var parsedURL = new Url("http://hoistedjs.com/moretesting?topic=data#migration/path");

                it("origin equals `http://hoistedjs.com`", function() {
                  expect(parsedURL.origin).to.equal("http://hoistedjs.com");
                });

                it("href equals `http://hoistedjs.com/moretesting?topic=data#migration/path`", function() {
                  expect(parsedURL.href).to.equal("http://hoistedjs.com/moretesting?topic=data#migration/path");
                });

                it("protocol equals `http:`", function() {
                  expect(parsedURL.protocol).to.equal("http:");
                });

                it("hostname equals `hoistedjs.com`", function() {
                  expect(parsedURL.hostname).to.equal("hoistedjs.com");
                });

                it("pathname equals `/moretesting/`", function() {
                  expect(parsedURL.pathname).to.equal("/moretesting");
                });

                it("search equals `?topic=data`", function() {
                  expect(parsedURL.search).to.equal("?topic=data");
                });

                it("hash equals `#migration/path`", function() {
                  expect(parsedURL.hash).to.equal("#migration/path");
                });
              });

              describe("with a port", function() {
                describe("for `http://hoistedjs.com:599/moretesting?topic=data#migration/path`", function() {
                  var parsedURL = new Url("http://hoistedjs.com:599/moretesting?topic=data#migration/path");

                  it("origin equals `http://hoistedjs.com:599`", function() {
                    expect(parsedURL.origin).to.equal("http://hoistedjs.com:599");
                  });

                  it("href equals `http://hoistedjs.com:599/moretesting?topic=data#migration/path`", function() {
                    expect(parsedURL.href).to.equal("http://hoistedjs.com:599/moretesting?topic=data#migration/path");
                  });

                  it("protocol equals `http:`", function() {
                    expect(parsedURL.protocol).to.equal("http:");
                  });

                  it("hostname equals `hoistedjs.com`", function() {
                    expect(parsedURL.hostname).to.equal("hoistedjs.com");
                  });

                  it("port equals `599`", function() {
                    expect(parsedURL.port).to.equal('599');
                  });

                  it("pathname equals `/moretesting`", function() {
                    expect(parsedURL.pathname).to.equal("/moretesting");
                  });

                  it("search equals `?topic=data`", function() {
                    expect(parsedURL.search).to.equal("?topic=data");
                  });

                  it("hash equals `#migration/path`", function() {
                    expect(parsedURL.hash).to.equal("#migration/path");
                  });
                });
              });
            });
          });
        });
      });
    });

  });

});
