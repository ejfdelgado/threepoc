var browserify = require("browserify");
var gulp = require("gulp");
var source = require("vinyl-source-stream");
var buffer = require("vinyl-buffer");
var log = require("fancy-log");
var tsify = require("tsify");
var babelify = require("babelify");
var watchify = require("watchify");
var sourcemaps = require("gulp-sourcemaps");

function es6Bundle() {
  log("✳️  ES6 Bundling!");
  return (
    browserify({
      debug: false,
    })
      .add("./src/index.mjs")
      //.require(require.resolve('three/build/three.module.js'), { expose: 'three' })
      .plugin(tsify, { noImplicitAny: true })
      .transform(babelify, {
        only: [
          "./node_modules/three/build/three.module.js",
          "./node_modules/three/examples/jsm/*",
        ],
        global: true,
        sourceType: "unambiguous",
        presets: [
          [
            "@babel/preset-env",
            {
              targets: {
                esmodules: true,
              },
            },
          ],
        ],
        plugins: ["@babel/plugin-transform-modules-commonjs"],
      })
      .bundle()
      .on("error", function (e) {
        log.error("Error when updating the Bundle: \n" + e);
      })
      .on("end", function () {
        log("➡️  Bundle created, uploading to dist");
      })
      .pipe(source("bundle.js"))
      .pipe(gulp.dest("dist"))
      .on("end", function () {
        log("✅  Bundle Updated");
      })
  );
}

function compile(watch) {
  var bundler = (
    browserify("./src/index.mjs", { debug: true })
    .transform(
      babelify.configure({
        only: [
          "./src/*",
          "./node_modules/three/build/three.module.js",
          "./node_modules/three/examples/jsm/*",
        ],
        sourceType: "unambiguous",
        presets: [
          [
            "@babel/preset-env",
            {
              targets: {
                esmodules: true,
                //esmodules: "commonjs",
              },
            },
          ],
        ],
        plugins: [
          "@babel/plugin-transform-modules-commonjs",
          "@babel/plugin-proposal-class-properties",
        ],
      })
    )
  );

  function rebundle() {
    return bundler
      .bundle()
      .on("error", function (err) {
        console.error(err);
        this.emit("end");
      })
      .pipe(source("build.js"))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(sourcemaps.write("./"))
      .pipe(gulp.dest("./build"));
  }

  if (watch) {
    bundler.on("update", function () {
      console.log("-> bundling...");
      rebundle();
    });
  }

  return rebundle();
}

function watch() {
  return compile(true);
}

gulp.task("build", function () {
  return compile();
});
gulp.task("watch", function () {
  return watch();
});
gulp.task("js", function () {
  return es6Bundle();
});
