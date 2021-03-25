import { MiSeguridad } from "../firebase/MiSeguridad.mjs";
import { SecurityInterceptor } from "../firebase/SecurityInterceptor.mjs";
import { Utilidades } from "../../common/Utilidades.mjs";

SecurityInterceptor.register();

export class ModuloPagina {
  static diferidoLectura = null;
  static async leerInterno(opcionesUsr = {}) {
    const opciones = {
      logged: false,
      tit: "Título",
      desc: "Descripción",
      img: null,
      kw: "",
    };
    Object.assign(opciones, opcionesUsr);
    await MiSeguridad.buscarUsuario(opciones["logged"]);
    const params = Utilidades.getQueryParams();
    const queryParams = {
      pg: params["pg"],
      tit: opciones["tit"],
      desc: opciones["desc"],
      img: opciones["img"],
      kw: opciones["kw"],
    };
    const url = new URL(`${location.origin}/api/xpage/`);
    url.search = Utilidades.generateQueryParams(queryParams);
    const rta = await fetch(url, { method: "GET" }).then((res) => res.json());
    return rta;
  }
  static async leer(opciones = {}) {
    if (ModuloPagina.diferidoLectura == null) {
      ModuloPagina.diferidoLectura = ModuloPagina.leerInterno(opciones);
    }
    return ModuloPagina.diferidoLectura;
  }
  static async leer2(sincronizar) {}
  static async leerTodo(sincronizar) {
    const promesaLeer = ModuloPagina.leer();
    const promesaLeer2 = ModuloPagina.leer2(sincronizar);
    const partes = await Promise.all([promesaLeer, promesaLeer2]);
    return partes;
  }
}
