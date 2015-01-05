define([
  "chai"
], function(chai) {

  window.chai   = chai;
  window.expect = chai.expect;
  window.assert = chai.assert;

  mocha.setup("bdd");

  require([
    "tests/specs/file",
    "tests/specs/resolver"
  ], function () {
    if (window.mochaPhantomJS) {
      window.mochaPhantomJS.run();
    } else {
      mocha.run();
    }
  });
});
