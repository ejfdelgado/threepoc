import { ModuloArchivos } from "../../../common/ModuloArchivos.mjs";
import { ModuloActividad } from "../../common/ModuloActividad.mjs";
import { Utilidades } from "../../../common/Utilidades.mjs";
import { ModuloTupla } from "../../page/ModuloTupla.mjs";
import { ModuloPagina } from "../../page/ModuloPagina.mjs";

export class HtmlEditorComponentClass {
  constructor($scope, $rootScope) {
    $rootScope.$on("saveAll", (datos) => {
      this.save();
    });
    $rootScope.$on("editPage", function (datos) {
      ModuloPagina.editPage({});
    });
    $rootScope.$on("newPage", function (datos) {
      ModuloPagina.createNewPage().then((rta) => {
        window.open(rta.url, "_blank");
      });
    });
    $rootScope.$on("searchPages", function (datos) {
      ModuloPagina.showSearchPages();
    });
    $rootScope.$on("viewPage", async function (datos) {
      const ref = await ModuloPagina.leer();
      const pubUrl = `${location.origin}${location.pathname}pg${ref.valor.id}/`;
      window.open(pubUrl, '_blank');
    });
    this.$scope = $scope;
  }
  $onInit() {
    this.domains = {};
    this.services = {};

    const predefined = {
      images: {},
      texts: {},
    };
    const self = this;
    this.keyBoardInterpreter = async function (e) {
      if (e.ctrlKey && e.which == 83) {
        if (self.saving === true) {
          return;
        }
        self.saving = true;
        try {
          await self.save();
        } catch (e) {}
        self.saving = false;
      }
    };
    $(document).bind("keyup keydown", this.keyBoardInterpreter);

    this.readDomain("content", predefined).catch((e) => {});
  }
  $onDestroy() {
    $(document).unbind("keyup keydown", this.keyBoardInterpreter);
  }
  $onChanges(changesObj) {
    // Replaces the $watch()
  }
  $onPostLink() {
    // When the component DOM has been compiled attach you eventHandler.
  }
  $postLink() {
    //
  }
  async readDomain(domain = "", predefined = {}, useSubDomain) {
    const opciones = { dom: domain, useSubDomain: useSubDomain };
    if (domain == "null") {
      opciones.dom = null;
    }
    const servicio = new ModuloTupla(opciones);
    this.services[domain] = servicio;
    let rta = await servicio.leer();
    rta = Object.assign(predefined, rta);
    delete rta.value;
    this.domains[domain] = rta;
    await servicio.guardar(rta);
    this.$scope.$digest();
  }
  async saveTupla() {
    for (let domain in this.domains) {
      const valor = this.domains[domain];
      await this.services[domain].guardar(valor);
    }
  }
  async save() {
    let markup = document.documentElement.innerHTML;
    markup = markup.replace(/contenteditable=["'][^"']+["']/gi, "");
    markup = markup.replace(
      /paistv-editor-(navbar)/gi,
      ' style="display: none;"'
    );
    markup = markup.replace(/paistv-editor-[^\s]+/gi, "");
    markup = markup.replace(
      /<script\s+src=["']\.\/js\/dependencies\.min\.js["']\s+>\s+<\/script>/i,
      ""
    );

    const actividad = ModuloActividad.on();
    await this.saveTupla();
    const response = await ModuloArchivos.uploadFile({
      own: false,
      path: "index.html",
      data: markup,
    });
    const partesId = /(\d+)\/index\.html/.exec(response.key);
    const pgid = partesId[1];
    const pubUrl = `${location.origin}${location.pathname}pg${pgid}/`;
    response.pubUrl = pubUrl;
    console.log(JSON.stringify(response, null, 4));
    actividad.resolve();
  }
}

let RECOMPUTED_PATH = Utilidades.recomputeUrl(location, $("base").attr("href"));

console.log(RECOMPUTED_PATH);

export const HtmlEditorComponent = {
  bindings: {
    page: "<",
  },
  templateUrl: `${RECOMPUTED_PATH.pathname}html/index.html`,
  controller: ["$scope", "$rootScope", HtmlEditorComponentClass],
};
