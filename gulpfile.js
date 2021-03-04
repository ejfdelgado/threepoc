var browserify = require("browserify");
var gulp = require("gulp");
var source = require("vinyl-source-stream");
var log = require("fancy-log");
var babelify = require("babelify");

const arg = ((argList) => {
  let arg = {},
    a,
    opt,
    thisOpt,
    curOpt;
  for (a = 0; a < argList.length; a++) {
    thisOpt = argList[a].trim();
    opt = thisOpt.replace(/^\-+/, "");

    if (opt === thisOpt) {
      // argument value
      if (curOpt) arg[curOpt] = opt;
      curOpt = null;
    } else {
      // argument name
      curOpt = opt;
      arg[curOpt] = true;
    }
  }

  return arg;
})(process.argv);

function es6Bundle() {
  log("✳️  ES6 Bundling! " + JSON.stringify(arg));
  return browserify({
    debug: false,
  })
    .add(`./src/pocs/${arg.poc}/js/index.js`)
    .transform(babelify, {
      only: [
        "./src/*",
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
      plugins: [
        "@babel/plugin-transform-modules-commonjs",
        "@babel/plugin-proposal-class-properties",
      ],
    })
    .bundle()
    .on("error", function (e) {
      log.error("Error when updating the Bundle: \n" + e);
    })
    .on("end", function () {
      log("➡️  Bundle created, uploading to dist");
    })
    .pipe(source("index.min.js"))
    .pipe(gulp.dest(`./src/pocs/${arg.poc}/js`))
    .on("end", function () {
      log("✅  Bundle Updated");
    });
}

gulp.task("js", function () {
  return es6Bundle();
});
