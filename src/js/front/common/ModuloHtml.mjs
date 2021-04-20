import { Utilidades } from "../../common/Utilidades.mjs";

export class ModuloHtml {
  static ATTRIBUTES = ["ng-src", "ng-model", "ng-data"];
  static CACHE = {};
  static async getHtml(url, opciones = {}) {
    opciones = Object.assign(
      {
        avoidCache: false,
      },
      opciones
    );
    return new Promise(async (resolve, reject) => {
      let val = null;
      if (opciones.avoidCache !== true) {
        val = ModuloHtml.CACHE[url];
        if (typeof val == "string") {
          resolve(val);
          return;
        }
      }
      val = await fetch(url, { method: "GET" }).then((res) => res.text());
      ModuloHtml.CACHE[url] = val;
      resolve(val);
    });
  }
  static modelToHtml(scope, element) {
    for (let i = 0; i < ModuloHtml.ATTRIBUTES.length; i++) {
      const attribute = ModuloHtml.ATTRIBUTES[i];
      element.find(`[${attribute}]`).each(function (i, elem) {
        const elemJ = $(elem);
        const ruta = elemJ.attr(attribute);
        const valor = Utilidades.leerObj(scope, ruta, "");
        if (attribute == "ng-model") {
          elemJ.val(valor);
        } else if (attribute == "ng-data") {
          elemJ.text(valor);
        } else if (attribute == "ng-src") {
          elemJ.attr("src", valor);
        }
      });
    }
  }
  static htmlToModel(element) {
    const scope = {};
    for (let i = 0; i < ModuloHtml.ATTRIBUTES.length; i++) {
      const attribute = ModuloHtml.ATTRIBUTES[i];
      element.find(`[${attribute}]`).each(function (i, elem) {
        const elemJ = $(elem);
        const ruta = elemJ.attr(attribute);
        let valor = null;
        if (attribute == "ng-model") {
          valor = elemJ.val();
        } else if (attribute == "ng-data") {
          valor = elemJ.text();
        } else if (attribute == "ng-src") {
          valor = elemJ.attr("src");
        }
        Utilidades.asignarObj(scope, ruta, valor);
      });
    }
    return scope;
  }
}
