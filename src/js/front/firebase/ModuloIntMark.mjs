import { Utiles } from "../../common/Utiles.mjs";
import MD5 from "../../../node_modules/blueimp-md5-es6/js/md5.js";
import { MiSeguridad } from "./MiSeguridad.mjs";
import { Utilidades } from "../../common/Utilidades.mjs";

export class ModuloIntMark {
  static RAIZ = "/pgs";
  static diferidoId = null;
  static LLAVE_LOCAL_STORAGE = MD5(Utiles.getReferer());
  static opciones = {
    masterLoged: false,
    slaveLoged: false,
    masterIdUsr: false,
    slaveIdUsr: false, //Usar el user uid para crear la entrada en la base de datos firebase
    useFirebase: false,
  };
  static async computeDiferidoId() {
    await MiSeguridad.inicializar();
    console.log(`miseguridad ok`);
    const urlParam = Utilidades.getQueryParams(location.href);
    const forzarUsuario =
      [null, "", undefined].indexOf(urlParam["pg"]) >= 0 ||
      ModuloIntMark.opciones["slaveLoged"] ||
      ModuloIntMark.opciones["slaveIdUsr"];
    const principal = await MiSeguridad.buscarUsuario(forzarUsuario);
  }
  static async getDiferidoIntMark(opcionesUsr = {}) {
    if (ModuloIntMark.diferidoId == null) {
      Object.assign(ModuloIntMark.opciones, opcionesUsr);
      ModuloIntMark.diferidoId = ModuloIntMark.computeDiferidoId();
    }
    return ModuloIntMark.diferidoId;
  }
  static darIdAnonimo() {
    var temp = localStorage[ModuloIntMark.LLAVE_LOCAL_STORAGE];
    if (temp === undefined) {
      return null;
    }
    return temp;
  }
  static asignarIdAnonimo(id) {
    localStorage[ModuloIntMark.LLAVE_LOCAL_STORAGE] = id;
  }
}
