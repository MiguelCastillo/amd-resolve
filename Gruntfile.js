//
// http://24ways.org/2013/grunt-is-not-weird-and-hard/
//
module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    connect: {
      test: {
        options: {
          port: 8512,
          hostname: 'localhost'
        }
      },
      keepalive: {
        options: {
          port: 8519,
          host: "localhost",
          keepalive: true,
          open: "http://localhost:8519/tests/SpecRunner.html"
        }
      }
    },
    mocha: {
      test: {
        options: {
          log: true,
          logErrors: true,
          reporter: "Spec",
          run: false,
          timeout: 10000,
          urls: ["http://localhost:8512/tests/SpecRunner.html"]
        }
      }
    },
    browserify: {
      // browserify src/resolver.js -o dist/amd-resolver.js -s amd-resolver --dg false
      options: {
        browserifyOptions: {
          detectGlobals: false,
          standalone: "amd-resolver"
        }
      },
      debug: {
        options: {
          browserifyOptions: {
            debug: true
          }
        },
        src: "src/resolver.js",
        dest: "dist/amd-resolver.js"
      },
      release: {
        src: "src/resolver.js",
        dest: "dist/amd-resolver.js"
      }
    },
    watch: {
      browserify: {
        files: "src/**/*.js",
        tasks: "build-debug"
      }
    },
    jshint: {
      all: [
        "Gruntfile.js",
        "src/**/*.js",
        "tests/**/*.js"
      ],
      options: {
        reporter: require("jshint-stylish"),
        jshintrc: true
      }
    },
    uglify: {
      release: {
        options: {
          report: "gzip", // Reports both gzip and minified
          sourceMap: true
        },
        files: {
          "dist/amd-resolver.min.js": ["dist/amd-resolver.js"]
        }
      }
    }
  });

  grunt.loadNpmTasks("grunt-mocha");
  grunt.loadNpmTasks("grunt-browserify");
  grunt.loadNpmTasks("grunt-contrib-connect");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-contrib-uglify");

  grunt.registerTask("server", ["connect:keepalive"]);
  grunt.registerTask("test", ["connect:test", "mocha:test"]);
  grunt.registerTask("lint", ["jshint"]);
  grunt.registerTask("build-debug", ["jshint", "browserify:debug"]);
  grunt.registerTask("build-release", ["jshint", "browserify:release", "uglify:release"]);
  grunt.registerTask("watch-sources", ["watch:browserify"]);
};
