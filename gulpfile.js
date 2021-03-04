var browserify = require("browserify");
var gulp = require("gulp");
var source = require("vinyl-source-stream");
var log = require("fancy-log");
var tsify = require("tsify");
var babelify = require("babelify");

function es6Bundle() {
  log("✳️  ES6 Bundling!");
  return (
    browserify({
      debug: false,
    })
      .add("./src/index.ts")
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

gulp.task("js", function () {
  return es6Bundle();
});
