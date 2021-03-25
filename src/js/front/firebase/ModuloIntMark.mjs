import { Utiles } from "../../common/Utiles.mjs";
import MD5 from "../../../node_modules/blueimp-md5-es6/js/md5.js";
import { MiSeguridad } from "./MiSeguridad.mjs";
import { Utilidades } from "../../common/Utilidades.mjs";
import { ModuloPagina } from "../page/ModuloPagina.mjs";

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
    const contextoPagina = await ModuloPagina.leerTodo(
      ModuloIntMark.opciones.sincronizar
    );
    const lecturaBasica = contextoPagina[0];
    const lecturaLarga = contextoPagina[1];

    const modelo = lecturaBasica.valor;
    modelo.desc += ".";
    const urlPut = new URL(`${location.origin}/api/xpage/`);
    urlPut.search = Utilidades.generateQueryParams({ pg: modelo.id });
    fetch(urlPut, {
      method: "PUT",
      body: JSON.stringify(modelo),
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((json) => {
        console.log(json);
        const urlDelete = new URL(`${location.origin}/api/xpage/`);
        urlDelete.search = Utilidades.generateQueryParams({ pg: modelo.id });

        fetch(urlDelete, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        })
          .then((res2) => res2.json())
          .then((json2) => {
            console.log(json2);
          });
      });

    console.log(lecturaBasica);
    console.log(lecturaLarga);
    //funcionContinuar(principal, lecturaBasica, lecturaLarga);
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
