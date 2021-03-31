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
}
