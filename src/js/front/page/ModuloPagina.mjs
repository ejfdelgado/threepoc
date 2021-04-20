import { MiSeguridad } from "../firebase/MiSeguridad.mjs";
import { SecurityInterceptor } from "../firebase/SecurityInterceptor.mjs";
import { Utilidades } from "../../common/Utilidades.mjs";
import { Deferred } from "../../common/Deferred.mjs";
import { ModuloHtml } from "../common/ModuloHtml.mjs";
import { ModuloModales } from "../common/ModuloModales.mjs";

SecurityInterceptor.register();

export class ModuloPagina {
  static diferidoLectura = new Deferred();
  static diferidoLecturaDone = false;
  static async leerInterno(opcionesUsr = {}) {
    const opciones = {
      logged: false,
      tit: "Título",
      desc: "Descripción",
      img: "/z/img/back.jpg",
      kw: "palabras claves",
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
    if (!ModuloPagina.diferidoLecturaDone) {
      ModuloPagina.diferidoLecturaDone = true;
      const rta = await ModuloPagina.leerInterno(opciones);
      ModuloPagina.diferidoLectura.resolve(rta);
    }
    return ModuloPagina.diferidoLectura.promise;
  }
  static async leerTodo(sincronizar) {
    const promesaLeer = ModuloPagina.leer();
    const promesaLeer2 = ModuloPagina.leer2(sincronizar);
    const partes = await Promise.all([promesaLeer, promesaLeer2]);
    return partes;
  }
  static async editPage(opciones = {}) {
    opciones = Object.assign({}, opciones);
    const urlTemplate = "/js/front/page/html/editPageProperties.html";
    return new Promise(async (resolve) => {
      await ModuloModales.basic({
        message: await ModuloHtml.getHtml(urlTemplate),
        size: "lg",
        useHtml: true,
        angular: opciones.angular,
        buttons: [
          {
            text: "Cancelar",
            class: "btn btn-secondary",
            action: async (close) => {
              resolve(false);
              close();
            },
          },
          {
            text: "Guardar",
            class: "btn btn-primary",
            action: async (close) => {
              resolve(true);
              close();
            },
          },
        ],
      });
    });
  }
}
