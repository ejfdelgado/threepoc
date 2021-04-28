import { MiSeguridad } from "../firebase/MiSeguridad.mjs";
import { SecurityInterceptor } from "../firebase/SecurityInterceptor.mjs";
import { Utilidades } from "../../common/Utilidades.mjs";
import { Deferred } from "../../common/Deferred.mjs";
import { ModuloHtml } from "../common/ModuloHtml.mjs";
import { ModuloModales } from "../common/ModuloModales.mjs";
import { ModuloActividad } from "../common/ModuloActividad.mjs";
import { Utiles } from "../../common/Utiles.mjs";

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
    if (values.kw instanceof Array) {
      $('[name="keywords"]').attr("content", values.kw.join(" "));
    } else {
      $('[name="keywords"]').attr("content", values.kw);
    }
  }
  static async createNewPage(opciones = {}) {
    opciones.add = "1";
    const rta = await ModuloPagina.leerInterno(opciones);
    let url = location.origin + location.pathname;
    const params = Utilidades.getQueryParams(location.href);
    params.pg = rta.valor.id;
    url += "?" + Utilidades.generateQueryParams(params);
    rta.url = url;
    return rta;
  }
  static async leerInterno(opcionesUsr = {}) {
    const opciones = {
      logged: false,
    };
    Object.assign(opciones, ModuloPagina.getCurrentPageValues());
    Object.assign(opciones, opcionesUsr);
    console.log(JSON.stringify(opciones));
    await MiSeguridad.buscarUsuario(opciones["logged"]);
    const params = Utilidades.getQueryParams();
    const queryParams = {
      pg: params.pg,
      tit: opciones.tit,
      desc: opciones.desc,
      img: opciones.img,
      kw: opciones.kw,
      add: opciones.add,
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
  static async search(opciones) {
    opciones = Object.assign(
      {
        aut: "",
      },
      opciones
    );
    const url = new URL(`${location.origin}/api/xpage/q/`);
    url.search = Utilidades.generateQueryParams(opciones);
    return await fetch(url, {
      method: "GET",
    }).then((res) => res.json());
  }
  static async editPage(opciones = {}) {
    opciones = Object.assign({}, opciones);
    const readPagePromise = ModuloPagina.leer();
    const urlTemplate = "/js/front/page/html/editPageProperties.html";
    return new Promise(async (resolve) => {
      const scope = {
        $ctrl: {
          page: {
            page: (await readPagePromise).valor,
          },
        },
      };
      await ModuloModales.basic({
        message: await ModuloHtml.getHtml(urlTemplate),
        size: "lg",
        useHtml: true,
        beforeShow: async (element) => {
          //Se valida la lista de permisos
          const page = scope.$ctrl.page.page;
          page.pr = Utiles.list2Text(page.pr);
          page.kw = Utiles.list2Text(page.kw);
          ModuloHtml.modelToHtml(scope, element);
        },
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
            action: async (close, element) => {
              const actividad = ModuloActividad.on();
              try {
                const newScope = ModuloHtml.htmlToModel(element);
                const page = newScope.$ctrl.page.page;
                page.pr = Utiles.text2List(page.pr);
                page.kw = Utiles.text2List(page.kw);
                $.extend(true, scope, newScope);
                await ModuloPagina.guardar(scope.$ctrl.page.page);
                ModuloPagina.setCurrentValues(scope.$ctrl.page.page);
                resolve(true);
                close();
                actividad.resolve();
              } catch (err) {
                ModuloModales.alert({ message: err });
                actividad.resolve();
              }
            },
          },
        ],
      });
    });
  }
  static async showSearchPages() {
    const urlTemplate = "/js/front/page/html/searchPages.html";
    const cardPage = await ModuloHtml.getHtml(
      "/js/front/page/html/cardPage.html"
    );
    await ModuloModales.basic({
      message: await ModuloHtml.getHtml(urlTemplate),
      size: "lg",
      useHtml: true,
      preShow: (element) => {
        element.find('input[name="q"]').focus();
      },
      beforeShow: async (element) => {
        const containerpages = element.find(".pages_found");
        const boton = element.find(".accion_search");
        const inputQ = element.find('input[name="q"]');
        const funcionBusqueda = function (event) {
          containerpages.empty();
          ModuloPagina.search({
            q: inputQ.val(),
          }).then((rta) => {
            const lista = rta.ans.ans;
            lista.forEach(function (page) {
              const nuevo = $(cardPage);
              nuevo.find(".card-title").html(page.tit);
              nuevo.find(".card-text").html(page.desc);
              nuevo.find(".open_page").on("click", function () {
                window.open(
                  `${location.origin}${page.path}?pg=${page.id}`,
                  "_blank"
                );
              });
              containerpages.append(nuevo);
            });
          });
        };
        inputQ.keypress(function (event) {
          var keycode = event.keyCode ? event.keyCode : event.which;
          if (keycode == "13") {
            funcionBusqueda();
          }
        });
        boton.on("click", funcionBusqueda);
      },
      buttons: [],
    });
  }
}
