import { ModuloHtml } from "./ModuloHtml.mjs";

export class ModuloModales {
  static async alert(opciones = {}) {
    return new Promise(async (resolve) => {
      opciones = Object.assign(
        {
          title: "Alerta",
          message: "Mensaje",
          useHtml: false,
          onClose: () => {
            resolve();
          },
          buttons: [
            {
              text: "Aceptar",
              class: "btn btn-primary",
              action: async (close) => {
                close();
              },
            },
          ],
        },
        opciones
      );
      await ModuloModales.basic(opciones);
    });
  }
  static async confirm(opciones = {}) {
    return new Promise(async (resolve) => {
      opciones = Object.assign(
        {
          title: "¿Está seguro?",
          message: "Por favor confirme.",
          useHtml: false,
          onClose: () => {
            resolve(false);
          },
          buttons: [
            {
              text: "Aceptar",
              class: "btn btn-primary",
              action: async (close) => {
                resolve(true);
                close();
              },
            },
            {
              text: "Cancelar",
              class: "btn btn-secondary",
              action: async (close) => {
                resolve(false);
                close();
              },
            },
          ],
        },
        opciones
      );
      await ModuloModales.basic(opciones);
    });
  }
  static async basic(opciones = {}) {
    opciones = Object.assign(
      {
        urlTemplate: "/js/front/common/html/basic.html",
        title: "",
        message: "",
        useHtml: false,
        buttons: [],
        forceActions: false,
        centered: false,
        size: "", // lg sm
        beforeShow: null,
        preShow: null,
        angular: null,
      },
      opciones
    );
    const html = await ModuloHtml.getHtml(opciones.urlTemplate);
    const elem = $(html);
    $("body").append(elem);
    const refFooter = elem.find(".modal-footer");
    const closeFunction = () => {
      elem.modal("hide");
    };

    opciones.buttons.forEach(function (button) {
      const buttonElem = $(
        `<button type="button" class="${button.class}"></button>`
      );
      buttonElem.text(button.text);
      refFooter.append(buttonElem);
      if (typeof button.action == "function") {
        buttonElem.on("click", function () {
          button.action(closeFunction, elem);
        });
      }
    });
    if (opciones.forceActions) {
      opciones.keyboard = false;
      opciones.backdrop = "static";
      elem.find('button[data-dismiss="modal"]').remove();
    }
    const elemDialog = elem.find(".modal-dialog");
    if (opciones.centered) {
      elemDialog.addClass("modal-dialog-centered");
    }
    if (opciones.size == "lg") {
      elemDialog.addClass("modal-lg");
    } else if (opciones.size == "sm") {
      elemDialog.addClass("modal-sm");
    }
    if (opciones.useHtml) {
      if ([null, undefined, ""].indexOf(opciones.title) < 0) {
        elem.find(".modal-title").html(opciones.title);
      }
      if ([null, undefined, ""].indexOf(opciones.message) < 0) {
        elem.find(".modal-body > p").html(opciones.message);
      }
    } else {
      if ([null, undefined, ""].indexOf(opciones.title) < 0) {
        elem.find(".modal-title").text(opciones.title);
      }
      if ([null, undefined, ""].indexOf(opciones.message) < 0) {
        elem.find(".modal-body > p").text(opciones.message);
      }
    }
    if (typeof opciones.beforeShow == "function") {
      await opciones.beforeShow(elem);
    }
    if ([null, undefined].indexOf(opciones.angular) < 0) {
      const scope = opciones.angular.scope;
      const compile = opciones.angular.compile;
      compile(elem)(scope);
    }
    elem.modal(opciones);
    elem.on("hidden.bs.modal", function (e) {
      elem.remove();
      if (typeof opciones.onClose == "function") {
        opciones.onClose();
      }
    });
    elem.on("shown.bs.modal", function (e) {
      if (typeof opciones.preShow == "function") {
        opciones.preShow(elem);
      }
    });
    return {
      closeFunction: closeFunction,
      elem: elem,
    };
  }
}
