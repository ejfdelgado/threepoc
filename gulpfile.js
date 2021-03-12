const browserify = require("browserify");
const gulp = require("gulp");
const source = require("vinyl-source-stream");
const log = require("fancy-log");
const babelify = require("babelify");
const buffer = require("vinyl-buffer");
const uglify = require("gulp-uglify");

const NODE_FILES = [
  "./node_modules/jquery/dist/jquery.min.js",
  "./node_modules/three/build/three.module.js",
  "./node_modules/three/examples/jsm/controls/OrbitControls.js",
  "./node_modules/three/examples/jsm/controls/TrackballControls.js",
  "./node_modules/three/examples/jsm/loaders/DRACOLoader.js",
  "./node_modules/three/examples/jsm/loaders/GLTFLoader.js",

  "./node_modules/angular/angular.min.js",
  "./node_modules/angular/angular.min.js.map",
  "./node_modules/angular-ui-router/release/angular-ui-router.min.js",
  "./node_modules/angular-ui-router/release/angular-ui-router.min.js.map",
  
  "./node_modules/firebase/firebase-auth.js",
  "./node_modules/firebase/firebase-auth.js.map",
  "./node_modules/firebase/firebase-app.js",
  "./node_modules/firebase/firebase-app.js.map",
  "./node_modules/firebaseui/dist/firebaseui.js",
  "./node_modules/firebaseui/dist/firebaseui.css"
];

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
  let pipes1 = browserify({
    debug: (arg.debug == "yes"),
  })
    .add(`./src/1/${arg.poc}/js/index.mjs`)
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
    .pipe(buffer());
  if (arg.pretty != "yes") {
    pipes1 = pipes1.pipe(uglify());
  }

  return pipes1
    .pipe(gulp.dest(`./src/1/${arg.poc}/js`))
    .on("end", function () {
      log("✅  Bundle Updated");
    });
}

function copyNodeModulesBundle() {
  return gulp
    .src(NODE_FILES, { base: "./node_modules" })
    .pipe(gulp.dest("./src/node_modules"));
}

gulp.task("js", function () {
  return es6Bundle();
});

gulp.task("node_modules", function () {
  return copyNodeModulesBundle();
});
