export class Constants {
  static SITE_NAME = "País TV";
  static ROOT_FOLDER = "/1/trans";
  static PROJECT_ID = "proyeccion-colombia1";
  //static PROJECT_ID = "paistv";
  static ADMINISTRADORES = ["google.com/edgar.jose.fernando.delgado@gmail.com"];
  static DEFAULT_BUCKET = Constants.PROJECT_ID + ".appspot.com";
  static GOOGLE_PUBLIC = "https://storage.googleapis.com/";
  static PUBLIC_BUCKET_PREFIX =
    Constants.GOOGLE_PUBLIC + Constants.PROJECT_ID + ".appspot.com/public";
  static firebase = {
    databaseURL: "https://" + Constants.PROJECT_ID + ".firebaseio.com",
  };
  static VALID_BUCKET_KEYS = function () {
    return [
      // Como si fuera simplemente la llave ^public/usr/
      /^(public\/usr\/[^?]+)/,
      // Como si fuera una ruta local al api /storage/read?name=public/usr/
      /\/storage\/read\?name=(public\/usr\/[^?]+)$/,
      // Como si fuera https://storage.googleapis.com/[^/]+/public/usr/
      new RegExp(Constants.GOOGLE_PUBLIC + "[^/]+/(public/usr/[^?]+)"),
    ];
  };
  static SEARCH_PAGE_MIN_TOKEN = 3;
  static HTML_404 = "/z/html/404.html";
  static getSavedTemplateUrl(pathname, pgid) {
    return `/usr/anonymous${pathname}pg/${pgid}/index.html`;
  }
  static getSavedTemplateRegexp() {
    return /^public\/usr\/anonymous\/[\d]+\/.+\/pg\/[\d]+\/index.html$/i;
  }
  static TEMPLATED_PATHS = ["/1/html/simple/"];
  static HTML_EDITOR_PATH = "/1/html/base";
  static HOMOLOGATION_FILES = {
    "/favicon.ico": "/z/img/favicon.ico",
    "/1/html/simple/js/index.mjs": Constants.HTML_EDITOR_PATH + "/js/index.mjs",
    "/1/html/simple/js/index.min.js":
      Constants.HTML_EDITOR_PATH + "/js/index.min.js",
    "/1/html/simple/js/dependencies.min.js":
      Constants.HTML_EDITOR_PATH + "/js/dependencies.min.js",
  };
}
