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
}
