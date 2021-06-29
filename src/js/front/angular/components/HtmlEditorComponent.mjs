import { ModuloArchivos } from "../../../common/ModuloArchivos.mjs";
import { ModuloActividad } from "../../common/ModuloActividad.mjs";
import { Utilidades } from "../../../common/Utilidades.mjs";
import { ModuloTupla } from "../../page/ModuloTupla.mjs";
import { ModuloPagina } from "../../page/ModuloPagina.mjs";
import { ModuloModales } from "../../common/ModuloModales.mjs";
import { ModuloHtml } from "../../common/ModuloHtml.mjs";
import { Utiles } from "../../../common/Utiles.mjs";

export class HtmlEditorComponentClass {
  constructor($scope, $rootScope, $filter, $parse, $compile, ngifSearch) {
    const self = this;
    this.ngifSearch = ngifSearch;
    this.$filter = $filter;
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
      window.open(pubUrl, "_blank");
    });
    $rootScope.$on("editPageOptions", async function () {
      const urlTemplate = "/js/front/page/html/editPageOptions.html";
      await ModuloModales.basic({
        title: "Selecciona las opciones",
        message: await ModuloHtml.getHtml(urlTemplate),
        size: "sm",
        useHtml: true,
        preShow: function () {
          self.$scope.$digest();
        },
        angular: {
          scope: self.$scope,
          compile: $compile,
        },
      });
    });

    $scope.PAIS_EDITOR_POOL_DATABASE = PAIS_EDITOR_POOL_DATABASE;
    this.$scope = $scope;
  }
  $onInit() {
    this.domains = {};
    this.services = {};
    window.ALL_MODEL = this.domains;

    const PREDEFINED = {
      images: {},
      texts: {},
      subDomain: {},
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

    this.readDomain("content", PREDEFINED).catch((e) => {});
    this.readDomain("ifs", PREDEFINED).catch((e) => {});
  }
  $onDestroy() {
    $(document).unbind("keyup keydown", this.keyBoardInterpreter);
  }
  $onChanges(changesObj) {
    // Replaces the $watch()
  }
  $onPostLink() {}
  $postLink() {
    const referer = Utiles.getReferer();
    const partes = /\/1\/html([^?#]*)/.exec(referer);
    const indexFile = partes[0] + "html/index.html";
    this.ngifSearch.registerListener((valores) => {
      this.$scope.$ctrl.ifs = valores;
    }, indexFile);
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

    // Se quita todo lo que hay entre <!-- paistv-editor { --> y <!-- paistv-editor } -->
    markup = markup.replace(
      /<!--[\s]*paistv-editor[\s]*{[\s]*-->[\s\S]*?<!--[\s]*paistv-editor[\s]*}[\s]*-->/g,
      ""
    );

    // Se quitan todos los contenteditable
    markup = markup.replace(/contenteditable=["'][^"']+["']/gi, "");

    // Se quitan los ng-if que tengan message al lado
    markup = markup.replace(/ng-if="[^"]+"[^>]+message="[^"]+"/gi, "");

    // Se quitan todos los atributos que comienzan con paistv-editor-algo
    markup = markup.replace(/paistv-editor-[^\s]+/gi, "");

    // Se remplaza todas las clases que tienen paistv-only-editor con invisible
    markup = markup.replace(
      /(class="[^"]*?)(paistv-only-editor)([^"]*?")/g,
      "$1invisible$3"
    );
    // Se eliminan el script de dependencias
    markup = markup.replace(
      /<script\s+src=["']\.\/js\/dependencies\.min\.js["']\s+>\s+<\/script>/i,
      ""
    );
    const json_model = JSON.stringify(this.domains);
    markup = markup.replace(
      "<head>",
      `<head><script>const ALL_MODEL=${json_model}</script>`
    );

    const actividad = ModuloActividad.on();
    await this.saveTupla();
    const header = '<!DOCTYPE html><html lang="es">';
    const footer = "</html>";
    const response = await ModuloArchivos.uploadFile({
      own: false,
      path: "index.html",
      data: `${header}${markup}${footer}`,
    });
    const partesId = /(\d+)\/index\.html/.exec(response.key);
    const pgid = partesId[1];
    const pubUrl = `${location.origin}${location.pathname}pg${pgid}/`;
    response.pubUrl = pubUrl;
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
  controller: [
    "$scope",
    "$rootScope",
    "$filter",
    "$parse",
    "$compile",
    "ngifSearch",
    HtmlEditorComponentClass,
  ],
};
