var gulp = require("gulp");
var webserver = require("gulp-webserver");
var mochaPhantomJS = require("gulp-mocha-phantomjs");
var browserify = require("browserify");
var source = require("vinyl-source-stream");
var jshint = require("gulp-jshint");
var stylish = require("jshint-stylish");
var header = require('gulp-header');
var pkg = require('./package.json');


var date = new Date();
var today = date.toDateString() + " " + date.toLocaleTimeString();
var banner = "/*! <%= pkg.name %> v<%= pkg.version %> - " + today + ". (c) " + date.getFullYear() + " Miguel Castillo. Licensed under MIT */\n";


gulp.task("test", ["build-debug"], function() {
  return gulp.src("test/SpecRunner.html")
    .pipe(mochaPhantomJS({
      reporter: 'tap',
      mocha: {
        grep: 'pattern'
      },
      phantomjs: {
        viewportSize: {
          width: 1024,
          height: 768
        }
      }
    }));
});


gulp.task("serve", ["build-release", "build-debug"], function() {
  gulp.src(".")
    .pipe(webserver({
      livereload: true,
      open: "test/SpecRunner.html"
    }));

  gulp.watch(["src/**/*.js", "test/**/*.js"], ["build"]);
});


gulp.task("build-release", ["jshint"], function() {
  return browserify({
      debug: true, // Add source maps to output to allow minifyify convert them to minified source maps
      standalone: "amdresolver",
      detectGlobals: false,
    })
    .plugin("minifyify", {
      map: "dist/amd-resolver.min.js.map",
      output: "dist/amd-resolver.min.js.map"
    })
    .ignore("process")
    .add("./src/resolver.js")
    .bundle()
    .pipe(source("amd-resolver.min.js"))
    .pipe(header(banner, {pkg: pkg}))
    .pipe(gulp.dest("dist"));
});


gulp.task("build-debug", ["jshint"], function() {
  return browserify("./src/resolver.js", {
      standalone: "amdresolver",
      detectGlobals: false
    })
    .ignore("process")
    .bundle()
    .pipe(source("amd-resolver.js"))
    .pipe(header(banner, {pkg: pkg}))
    .pipe(gulp.dest("dist"));
});


gulp.task("build-debug-watch", function() {
  gulp.watch("src/**/*.js", ["build-debug"]);
});


gulp.task("jshint", function() {
  return gulp.src(["src/**/*.js", "test/**/*.js", "gulpfile.js"])
    .pipe(jshint())
    .pipe(jshint.reporter(stylish))
    .pipe(jshint.reporter("fail"));
});


gulp.task("build", ["jshint", "build-release", "build-debug"]);
