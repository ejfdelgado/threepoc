import { ModuloArchivos } from "../../../common/ModuloArchivos.mjs";
import { ModuloActividad } from "../../common/ModuloActividad.mjs";
import { Utilidades } from "../../../common/Utilidades.mjs";
import { Encolar } from "../../../common/Utilidades.mjs";
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
      // TODO usar el subdominio
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
    this.domainsState = {};
    this.services = {};
    window.ALL_MODEL = this.domains;

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

    const THE_DOMAINS = [
      {
        key: "content",
        pred: {
          images: {},
          texts: {},
          subDomain: {},
        },
      },
      {
        key: "ifs",
        pred: {},
      },
    ];
    for (let i = 0; i < THE_DOMAINS.length; i++) {
      const domainSpec = THE_DOMAINS[i];
      this.readDomain(domainSpec.key, domainSpec.pred).catch((e) => {});
    }
    this.$scope.$watch(
      `$ctrl.domainsState`,
      (newVal, oldVal, scope) => {
        const llaves = Object.keys(newVal);
        const ans = {
          sync: true,
        };
        for (let i = 0; i < llaves.length; i++) {
          const llave = llaves[i];
          const contenido = newVal[llave];
          if (contenido.sync === false) {
            ans.sync = false;
          }
        }
        const indicadorGuardado = $(".indicador_guardado");
        indicadorGuardado.removeClass("al_dia");
        indicadorGuardado.removeClass("no_al_dia");
        if (ans.sync) {
          // Todo está al día
          indicadorGuardado.addClass("al_dia");
        } else {
          // Hay cosas pendientes
          indicadorGuardado.addClass("no_al_dia");
        }
      },
      true
    );
  }
  $onDestroy() {
    $(document).unbind("keyup keydown", this.keyBoardInterpreter);
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
    this.domainsState[domain] = { sync: true };
    const llaveEncolamiento = `save.domain.${domain}`;
    // Se agrega el listener del modelo para guardar activamente
    this.$scope.$watch(
      `$ctrl.domains.${domain}`,
      (newVal, oldVal, scope) => {
        this.domainsState[domain].sync = false;
        Encolar.encolar(
          llaveEncolamiento,
          async () => {
            this.domainsState[domain].sync = true;
            this.$scope.$digest();
            const indicadorGuardado = $(".indicador_guardado");
            indicadorGuardado.addClass("guardado_en_progreso");
            await this.services[domain].guardar(newVal, undefined, undefined, {
              actividad: false,
            });
            indicadorGuardado.removeClass("guardado_en_progreso");
            indicadorGuardado.addClass("guardado_ok");
            setTimeout(() => {
              indicadorGuardado.removeClass("guardado_ok");
            }, 1000);
          },
          2000
        );
      },
      true
    );
    this.$scope.$digest();
  }
  async save() {
    let publicSubDomain = null;
    let publicPath = "index.html";
    if (this.domains && this.domains.content) {
      if (this.domains.content.subdomain) {
        publicSubDomain = this.domains.content.subdomain;
      }
      if (this.domains.content.bucketPath) {
        publicPath = this.domains.content.bucketPath;
      }
    }
    let markup = document.documentElement.innerHTML;

    // Se quita todo lo que hay entre <!-- paistv-editor { --> y <!-- paistv-editor } -->
    markup = markup.replace(
      /<!--[\s]*paistv-editor[\s]*{[\s]*-->[\s\S]*?<!--[\s]*paistv-editor[\s]*}[\s]*-->/g,
      ""
    );

    // Se quitan todos los comentarios
    markup = markup.replace(/<!--.*?-->/gi, "");

    // Se quitan todos los contenteditable
    markup = markup.replace(/contenteditable(=["'][^"']*["'])?/gi, "");

    // Se quitan los ng-if que tengan message al lado
    markup = markup.replace(/ng-if="[^"]+"[^>]+message="[^"]+"/gi, "");

    // dir-ptv-editor-image
    // dir-ptv-editor-text
    // dir-ptv-editor-link
    // dir-ptv-editor-download-link
    // dir-ptv-editor-repeat=""
    // dir-ptv-editor-html
    // dir-ptv-editor-select-image
    // dir-ptv-editor-text
    // Se quitan todos los atributos que comienzan con paistv-editor-algo dirPtvEditor
    markup = markup.replace(/dir-ptv-editor-[^\s>=]+(="[^"]*")?/gi, "");
    // Se quitan directivas de angular
    const directivasAngular = [
      "ng-bind-html",
      "ng-model",
      "ng-if",
      "ng-click",
      "ng-class",
      "ng-repeat",
    ];
    for (let i = 0; i < directivasAngular.length; i++) {
      const directiva = directivasAngular[i];
      const regexp = new RegExp(`${directiva}(="[^"]*")?`, "ig");
      markup = markup.replace(regexp, "");
    }

    // Se remplaza todas las clases que tienen paistv-only-editor con invisible
    markup = markup.replace(
      /(class="[^"]*?)(paistv-only-editor)([^"]*?")/g,
      "$1invisible$3"
    );
    const clasesAngular = [
      "ng-pristine",
      "ng-dirty",
      "ng-untouched",
      "ng-valid",
      "ng-not-empty",
      "ng-scope",
      "ng-isolate-scope",
      "ng-binding",
      "ng-touched",
      "ng-invalid",
      "ng-valid-required",
      "ng-invalid-required",
      "ng-empty",
    ];
    for (let i = 0; i < clasesAngular.length; i++) {
      const clase = clasesAngular[i];
      const regexp = new RegExp(`(class="[^"]*?)(${clase})([^"]*?")`, "ig");
      markup = markup.replace(regexp, "$1$3");
    }

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
    const header = '<!DOCTYPE html><html lang="es">';
    const footer = "</html>";
    const response = await ModuloArchivos.uploadFile({
      subDomainPrefix: `/p/${publicSubDomain}`,
      own: false,
      path: publicPath,
      data: `${header}${markup}${footer}`,
    });
    const partesId = /(\d+)\/index\.html/.exec(response.key);
    if (partesId != null) {
      const pgid = partesId[1];
      const pubUrl = `${location.origin}${location.pathname}pg${pgid}/`;
      response.pubUrl = pubUrl;
    }
    actividad.resolve();
  }
}

let RECOMPUTED_PATH = Utilidades.recomputeUrl(location, $("base").attr("href"));

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
