const browserify = require("browserify");
const gulp = require("gulp");
const source = require("vinyl-source-stream");
const log = require("fancy-log");
const babelify = require("babelify");
const buffer = require("vinyl-buffer");
const uglify = require("gulp-uglify");
const fs = require("fs");
const concat = require("gulp-concat");
const { parallel } = require("gulp");

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
  "./node_modules/firebase/firebase-database.js",
  "./node_modules/firebase/firebase-database.js.map",
  "./node_modules/firebaseui/dist/firebaseui.js",
  "./node_modules/firebaseui/dist/firebaseui.css",

  "./node_modules/json.sortify/dist/JSON.sortify.js",
  "./node_modules/event-emitter-es6/dist/event-emitter.min.js",
  "./node_modules/blueimp-md5-es6/js/md5.js",

  "./node_modules/jquery.qrcode/jquery.qrcode.min.js",

  "./node_modules/emojione/lib/js/*",
  "./node_modules/emojione/assets/css/**",
  "./node_modules/emojione/assets/sprites/**",

  "./node_modules/emojionearea/css/**",
  "./node_modules/emojionearea/js/**", //bug en línea 520 debe ser: data-name="{name}"/></i></i>

  "./node_modules/jquery-textcomplete/dist/jquery.textcomplete.min.js",

  "./node_modules/bootstrap/dist/css/bootstrap.min.css",
  "./node_modules/bootstrap/dist/css/bootstrap.min.css.map",
  "./node_modules/bootstrap/dist/js/bootstrap.min.js",
  "./node_modules/bootstrap/dist/js/bootstrap.min.js.map",

  "./node_modules/popper.js/dist/umd/popper.min.js",
  "./node_modules/popper.js/dist/umd/popper.min.js.map",

  "./node_modules/event-emitter-es6/dist/event-emitter.min.js",
  "./node_modules/crypto-js/**",
  "./node_modules/jsencrypt/bin/jsencrypt.min.js",

  "./node_modules/tinymce/tinymce.min.js",
  "./node_modules/tinymce/themes/silver/theme.min.js",
  "./node_modules/angular-ui-tinymce/dist/tinymce.min.js",
  "./node_modules/tinymce/plugins/link/plugin.min.js",
  "./node_modules/tinymce/plugins/image/plugin.min.js",
  "./node_modules/tinymce/plugins/code/plugin.min.js",
  "./node_modules/tinymce/skins/ui/oxide/skin.min.css",
  "./node_modules/tinymce/skins/ui/oxide/content.min.css",
  "./node_modules/tinymce/skins/content/default/content.min.css",
  "./node_modules/angular-sanitize/angular-sanitize.min.js",
  "./node_modules/angular-sanitize/angular-sanitize.min.js.map",
  "./node_modules/tinymce/icons/default/icons.min.js",

  "./node_modules/font-awesome/css/font-awesome.css",
  "./node_modules/font-awesome/fonts/**",
  
  "./node_modules/interactjs/dist/interact.min.js",
];

function bundleJs(filePath, subDomain=null) {
  // 1. Read file content
  const content = fs.readFileSync(filePath);
  // 2. Leer todas las ocurrencias de node_modules
  const PATRON = /<script\s+(.*)src=["']\/node_modules\/([^"']+)["'][^>]*>\s*<\/script>/gi;
  let m;
  const lista = [];
  do {
    m = PATRON.exec(content);
    if (m) {
      if (subDomain == null || new RegExp(`sub-domain=['"].*${subDomain}.*['"]`).exec(m[0]) != null) {
        lista.push(`./node_modules/${m[2]}`);
      }
    }
  } while (m);
  // 3. Unir todos los scrips en uno solo
  console.log(`Join ${lista}`);
  return lista;
}

function es6BundleLibs(opciones = {}) {
  let outputFile = 'dependencies.min.js';
  if (typeof opciones.subDomain == 'string') {
    outputFile = `dependencies-${opciones.subDomain}.min.js`;
  }
  log("✳️  ES6 Bundling Libs! " + JSON.stringify(arg) + " - " + JSON.stringify(opciones));
  const dependencies = bundleJs(`./src/1/${arg.poc}/index.html`, opciones.subDomain);
  return gulp
    .src(dependencies, { base: "./node_modules" })
    .pipe(concat(outputFile))
    .pipe(gulp.dest(`./src/1/${arg.poc}/js`));
}

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

function es6Bundle(opciones = {}) {
  log("✳️  ES6 Bundling! " + JSON.stringify(arg));
  let module = "index";
  if (typeof arg.filename == "string") {
    module = arg.filename;
  }
  if (typeof opciones.filename == "string") {
    module = opciones.filename;
  }
  const archivoSalida = `${module}.min.js`;
  log(`* Archivo de salida: ${archivoSalida}`);
  let pipes1 = browserify({
    debug: arg.debug == "yes",
  })
    .add(`./src/1/${arg.poc}/js/${module}.mjs`)
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
    .pipe(source(archivoSalida))
    .pipe(buffer());
  if (arg.pretty != "yes") {
    pipes1 = pipes1.pipe(uglify());
  }

  return pipes1.pipe(gulp.dest(`./src/1/${arg.poc}/js`)).on("end", function () {
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

gulp.task("jsSlave", function () {
  return es6Bundle({
    filename: "index-slave",
  });
});

gulp.task("jsPublic", function () {
  return es6Bundle({
    filename: "index-public",
  });
});

gulp.task("jslibs", function () {
  return es6BundleLibs();
});

gulp.task("jslibs_public", function () {
  const opciones = {
    subDomain: 'public_html'
  };
  return es6BundleLibs(opciones);
});

gulp.task("bundle", gulp.parallel("jslibs", "jsSlave", "js"));

gulp.task("bundle_public", gulp.parallel("jslibs_public", "jsPublic"));

gulp.task("node_modules", function () {
  return copyNodeModulesBundle();
});
