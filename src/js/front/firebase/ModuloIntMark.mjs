import { Utiles } from "../../common/Utiles.mjs";
import MD5 from "../../../node_modules/blueimp-md5-es6/js/md5.js";
import { MiSeguridad } from "./MiSeguridad.mjs";
import { Utilidades } from "../../common/Utilidades.mjs";
import { ModuloPagina } from "../page/ModuloPagina.mjs";

export class ModuloIntMark {
  static RAIZ = "/pgs";
  static diferidoId = null;
  static diferidoDB = null;
  static LLAVE_LOCAL_STORAGE = MD5(Utiles.getReferer());
  static opciones = {
    masterLoged: false,
    slaveLoged: false,
    masterIdUsr: false,
    slaveIdUsr: false, //Usar el user uid para crear la entrada en la base de datos firebase
    useFirebase: false,
  };

  static async computeDiferidoId() {
    const paquete = await ModuloIntMark.getDiferidoDb();

    return paquete;
  }

  static async computeDiferidoDb() {
    await MiSeguridad.inicializar();
    console.log(`miseguridad ok`);
    const urlParam = Utilidades.getQueryParams(location.href);
    const forzarUsuario =
      [null, "", undefined].indexOf(urlParam["pg"]) >= 0 ||
      ModuloIntMark.opciones["slaveLoged"] ||
      ModuloIntMark.opciones["slaveIdUsr"];
    const principal = await MiSeguridad.buscarUsuario(forzarUsuario);
    const contextoPagina = await ModuloPagina.leerTodo(
      ModuloIntMark.opciones.sincronizar
    );
    const lecturaBasica = contextoPagina[0].valor;
    const lecturaLarga = contextoPagina[1]; // Esto lo deberíamos sacar de acá

    var principalEsDuenio =
      [null, undefined].indexOf(principal) < 0 &&
      lecturaBasica["usr"] == principal["uid"];
    var solicitudSlave = urlParam["sl"] == "si";
    //es slave si lo solicita o si no es el duenio de la pagina
    var tipoCliente = solicitudSlave || !principalEsDuenio ? "slave" : "master";

    let database = null;
    if (ModuloIntMark.opciones.useFirebase) {
      database = firebase.database();
    }

    return {
      database: database, //Esto lo deberíamos sacar de acá
      principal: principal,
      ctx: lecturaBasica,
      tipoCliente: tipoCliente,
    };
  }

  /**
   * Retorna la promesa de la base de datos
   * @param opcionesUsr
   */
  static getDiferidoDb(opcionesUsr = {}) {
    if (ModuloIntMark.diferidoDb == null) {
      Object.assign(ModuloIntMark.opciones, opcionesUsr);
      ModuloIntMark.diferidoDb = ModuloIntMark.computeDiferidoDb();
    }
    return ModuloIntMark.diferidoDb;
  }

  static getDiferidoId(opcionesUsr = {}) {
    if (ModuloIntMark.diferidoId == null) {
      Object.assign(ModuloIntMark.opciones, opcionesUsr);
      ModuloIntMark.diferidoId = ModuloIntMark.computeDiferidoId();
    }
    return ModuloIntMark.diferidoId;
  }

  static async getDiferidoIntMark(opcionesUsr = {}) {
    return await ModuloIntMark.getDiferidoId(opcionesUsr);
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
