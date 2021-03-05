const browserify = require("browserify");
const gulp = require("gulp");
const source = require("vinyl-source-stream");
const log = require("fancy-log");
const babelify = require("babelify");
const buffer = require("vinyl-buffer");
const uglify = require("gulp-uglify");

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
    .add(`./src/poc/${arg.poc}/js/index.mjs`)
    .transform(babelify, {
      only: ["./src/*"],
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
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest(`./src/poc/${arg.poc}/js`))
    .on("end", function () {
      log("✅  Bundle Updated");
    });
}

gulp.task("js", function () {
  return es6Bundle();
});
