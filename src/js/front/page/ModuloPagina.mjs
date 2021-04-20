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
  static getCurrentPageValues() {
    return {
      tit: $('[name="og:title"]').attr("content"),
      desc: $('[name="og:description"]').attr("content"),
      img: $('[name="og:image"]').attr("content"),
      kw: $('[name="keywords"]').attr("content"),
    };
  }
  static setCurrentValues(values) {
    $("title").text(values.tit);
    $('[name="og:title"]').attr("content", values.tit);
    $('[name="og:description"]').attr("content", values.desc);
    $('[name="og:image"]').attr("content", values.img);
    $('[name="keywords"]').attr("content", values.kw);
  }
  static async leerInterno(opcionesUsr = {}) {
    const opciones = {
      logged: false,
    };
    Object.assign(opciones, ModuloPagina.getCurrentPageValues());
    Object.assign(opciones, opcionesUsr);
    await MiSeguridad.buscarUsuario(opciones["logged"]);
    const params = Utilidades.getQueryParams();
    const queryParams = {
      pg: params.pg,
      tit: opciones.tit,
      desc: opciones.desc,
      img: opciones.img,
      kw: opciones.kw,
    };
    const url = new URL(`${location.origin}/api/xpage/`);
    url.search = Utilidades.generateQueryParams(queryParams);
    const rta = await fetch(url, { method: "GET" }).then((res) => res.json());
    ModuloPagina.setCurrentValues(rta.valor);
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
  static async guardar(modelo) {
    const url = new URL(`${location.origin}/api/xpage/`);
    url.search = Utilidades.generateQueryParams({ pg: modelo.id });
    await fetch(url, {
      method: "PUT",
      body: JSON.stringify(modelo),
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());
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
              try {
                await ModuloPagina.guardar(opciones.angular.ctrl.page.page);
                ModuloPagina.setCurrentValues(opciones.angular.ctrl.page.page);
                resolve(true);
                close();
              } catch (err) {
                ModuloModales.alert({ message: err });
              }
            },
          },
        ],
      });
    });
  }
}
