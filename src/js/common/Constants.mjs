export class Constants {
  static SITE_NAME = "País TV";
  static EMAIL_SENDER = "info@pais.tv";
  static ROOT_FOLDER = "/1/html/simple";
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
  static MAX_BYTES_UPLOAD_FILES = 10 * 1024 * 1024;
  static getSubDomainPattern = function () {
    // sudo vim /etc/hosts
    return /([^.]+)\.pais\.tv(.*)/;
  };
  static VALID_BUCKET_KEYS = function () {
    return [
      // Como si fuera simplemente la llave ^public/usr/
      /^(public\/usr\/[^?]+)/,
      // Como si fuera una llave estática
      /^(public\/p\/[^?]+)/,
      // Como si fuera una ruta local al api /storage/read?name=public/usr/
      /\/storage\/read\?name=(public\/usr\/[^?]+)$/,
      // Como si fuera https://storage.googleapis.com/[^/]+/public/usr/
      new RegExp(Constants.GOOGLE_PUBLIC + "[^/]+/(public/usr/[^?]+)"),
    ];
  };
  static SEARCH_PAGE_MIN_TOKEN = 3;
  static HTML_404 = "/z/html/404.html";
  static getSavedTemplateUrl(pathname, pgid) {
    if (pathname.trim() == "/") {
      pathname = Constants.ROOT_FOLDER + "/";
    }
    return `/usr/anonymous${pathname}pg/${pgid}/index.html`;
  }
  static getSavedTemplateRegexp() {
    return /^public\/(usr\/anonymous\/[\d]+\/.+\/pg\/[\d]+|p\/.+)\/index.html$/i;
  }
  static TEMPLATED_PATHS = ["/1/html/simple/", "/1/html/cv/"];
  static HTML_EDITOR_PATH = "/1/html/base";
  static HOMOLOGATION_FILES() {
    const ans = {
      "/favicon.ico": "/z/img/favicon.ico",
    };
    for (let i = 0; i < Constants.TEMPLATED_PATHS.length; i++) {
      const path = Constants.TEMPLATED_PATHS[i];
      ans[path + "js/index.mjs"] = Constants.HTML_EDITOR_PATH + "/js/index.mjs";
      ans[path + "js/index.min.js"] =
        Constants.HTML_EDITOR_PATH + "/js/index.min.js";
      ans[path + "js/dependencies.min.js"] =
        Constants.HTML_EDITOR_PATH + "/js/dependencies.min.js";
    }
    return ans;
  }
}
