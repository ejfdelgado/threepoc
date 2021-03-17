export class Constants {
  static PROJECT_ID = "proyeccion-colombia1";
  //static PROJECT_ID = "paistv";
  static ADMINISTRADORES = ["google.com/edgar.jose.fernando.delgado@gmail.com"];
  static DEFAULT_BUCKET = Constants.PROJECT_ID + ".appspot.com";
  static PUBLIC_BUCKET_PREFIX =
    "https://storage.googleapis.com/" +
    Constants.PROJECT_ID +
    ".appspot.com/public";
  static firebase = {
    databaseURL: "https://" + Constants.PROJECT_ID + ".firebaseio.com",
  };
}
