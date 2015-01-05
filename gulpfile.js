var gulp = require("gulp");

var mochaPhantomJS = require('gulp-mocha-phantomjs');
gulp.task("test", ["build-debug"], function() {
  return gulp.src("tests/SpecRunner.html")
    .pipe(mochaPhantomJS());
});

var webserver = require("gulp-webserver");
gulp.task("test-browser", ["build-debug"], function() {
  gulp.src(".")
    .pipe(webserver({
      livereload: true,
      open: "tests/SpecRunner.html"
    }));

  gulp.watch("src/**/*.js", ["build-debug"]);
});

var browserify = require("browserify");
var source = require("vinyl-source-stream");
gulp.task("build-release", ["jshint"], function() {
  var bundler = new browserify({
    debug: true, // Add source maps to output to allow minifyify convert them to minified source maps
    standalone: "amd-resolver",
    detectGlobals: false
  });

  bundler.add("./src/resolver.js");

  bundler.plugin("minifyify", { map: "dist/amd-resolver.min.js.map", output: "dist/amd-resolver.min.js.map" })
    .bundle()
    .pipe(source("amd-resolver.min.js"))
    .pipe(gulp.dest("dist"));
});

gulp.task("build-debug-watch", function() {
  gulp.watch("src/**/*.js", ["build-debug"]);
});

gulp.task("build-debug", ["jshint"], function() {
  return browserify("./src/resolver.js", {
      debug: true, // Add source maps to output
      standalone: "amd-resolver",
      detectGlobals: false
    })
    .bundle()
    .pipe(source("amd-resolver.js"))
    .pipe(gulp.dest("dist"));
});

var jshint = require("gulp-jshint");
var stylish = require("jshint-stylish");
gulp.task("jshint", function() {
  return gulp.src(["src/**/*.js", "tests/**/*.js", "gulpfile.js"])
    .pipe(jshint())
    .pipe(jshint.reporter(stylish))
    .pipe(jshint.reporter("fail"));
});
