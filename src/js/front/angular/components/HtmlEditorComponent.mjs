import { ModuloArchivos } from "../../../common/ModuloArchivos.mjs";
import { ModuloActividad } from "../../common/ModuloActividad.mjs";
import { Utilidades } from "../../../common/Utilidades.mjs";
import { Encolar } from "../../../common/Utilidades.mjs";
import { ModuloTupla } from "../../page/ModuloTupla.mjs";
import { ModuloPagina } from "../../page/ModuloPagina.mjs";
import { ModuloModales } from "../../common/ModuloModales.mjs";
import { ModuloHtml } from "../../common/ModuloHtml.mjs";
import { Utiles } from "../../../common/Utiles.mjs";
import { ModuloQR } from "../../firebase/ModuloQR.mjs";
import { jsPdfLocal } from "../../../common/jsPdf.mjs";
import { Constants } from "../../../common/Constants.mjs";

export class HtmlEditorComponentClass {
  constructor($scope, $rootScope, $filter, $parse, $compile, ngifSearch) {
    const self = this;
    this.ngifSearch = ngifSearch;
    this.$filter = $filter;
    $rootScope.$on("saveAll", (datos) => {
      this.save();
    });
    $rootScope.$on("editPage", function (datos) {
      ModuloPagina.editPage({
        $scope: $rootScope,
        $compile: $compile,
      });
    });
    $rootScope.$on("newPage", function (datos) {
      ModuloPagina.createNewPage().then((rta) => {
        window.open(rta.url, "_blank");
      });
    });
    $rootScope.$on("searchPages", function (datos) {
      ModuloPagina.showSearchPages();
    });
    $rootScope.$on("printPoster", async function (datos) {
      const pubUrl = await HtmlEditorComponentClass.getPublicUrl($scope);
      HtmlEditorComponentClass.generateQRPdf({
        pubUrl: pubUrl,
        title: $scope.$ctrl.domains.content.general.title.replaceAll(
          /<\/?br\/?>/gi,
          ""
        ),
        phone: $scope.$ctrl.domains.content.data.phone,
      });
    });
    $rootScope.$on("viewPage", async function (datos) {
      const pubUrl = await HtmlEditorComponentClass.getPublicUrl($scope);
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
    $rootScope.$on("editFiles", async function () {
      const urlTemplate = "/js/front/page/html/editFiles.html";
      await ModuloModales.basic({
        title: "Administrar Archivos",
        message: await ModuloHtml.getHtml(urlTemplate),
        size: "lg",
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
    $rootScope.$on("editPermissions", async function () {
      const urlTemplate = "/js/front/page/html/editPermissions.html";
      const security = $scope.$ctrl.domains.security;
      $scope.$ctrl.permisionMatrix = {};
      const llaves = Object.keys(security);
      for (let i = 0; i < llaves.length; i++) {
        const llave = llaves[i];
        const nuevo = {};
        const viejo = security[llave];
        const rolesViejos = viejo.roles;
        if (rolesViejos instanceof Array) {
          for (let j = 0; j < rolesViejos.length; j++) {
            const unRolViejo = rolesViejos[j];
            if (unRolViejo.v) {
              nuevo[unRolViejo.v] = true;
            }
          }
        }
        $scope.$ctrl.permisionMatrix[llave] = nuevo;
      }

      await ModuloModales.basic({
        title: "Permisos",
        message: await ModuloHtml.getHtml(urlTemplate),
        size: "lg",
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
  static async getPublicUrl($scope) {
    const subdomain = $scope.$ctrl.domains.content.subdomain;
    let path = "";
    if (Constants.TEMPLATE_AUTO_INDEX_PATHS.indexOf(subdomain) >= 0) {
      const ref = await ModuloPagina.leer();
      path = `/${ref.valor.id}/`;
    } else {
      const bucketPath = $scope.$ctrl.domains.content.bucketPath;
      if (typeof bucketPath == "string" && bucketPath.trim().length > 0) {
        path = bucketPath
          .replace(/\/?(.*?)\/?(index.html)/, "/$1/")
          .replace("//", "/");
      }
    }
    let domain = location.origin;
    const pubUrl = domain.replace(
      /(https?:\/\/)([^/]*)/,
      `$1${subdomain}.$2${path}`
    );
    return pubUrl;
  }
  static getFontSize(text) {
    const total = text.length;
    const sinEspacios = text.replace(/[\s]/g, "").length;
    const espacios = total - sinEspacios;
    // Se asume que un espacio es como media letra
    const cantidad = 2 * sinEspacios + espacios;
    // SE ARRIENDA = 10*2 + 1 = 21 = 250
    // 3183412491 = 10*2      = 20 = 300
    // SE VENDE = 7*2 + 1     = 15 = 350
    return parseInt(-14.51613 * cantidad + 570.96774);
  }
  static async generateQRPdf(params) {
    const jElement = $('<div class="invisible"></div>');
    $("body").append(jElement);
    await ModuloQR.get(jElement, params.pubUrl);
    const canvas = jElement.find("canvas");
    var dataURL = canvas[0].toDataURL("image/png", 1.0);
    jElement.remove();
    params.qr = dataURL;
    const sizeTitle = HtmlEditorComponentClass.getFontSize(params.title);
    const textNumber = params.phone.url.replace(/^\s*\+57\s*/gi, "");
    const sizeNumber = HtmlEditorComponentClass.getFontSize(textNumber);
    const body = {
      options: { orientation: "portrait", unit: "mm", format: [1000, 700] },
      elements: [
        {
          type: "img",
          x: 50,
          y: 200,
          w: 600,
          h: 600,
          data: params.qr,
        },
        {
          type: "txt",
          data: params.title,
          x: 350,
          y: 125,
          size: sizeTitle,
          align: "center",
        },
        {
          type: "txt",
          data: textNumber,
          x: 350,
          y: 950,
          size: sizeNumber,
          align: "center",
        },
      ],
    };
    const doc = jsPdfLocal.process(jspdf.jsPDF, body);
    doc.save("Poster.pdf");
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
      {
        key: "files",
        pred: {
          lst: [],
        },
      },
      {
        key: "security",
        useSubDomain: true,
        pred: {},
      },
    ];
    for (let i = 0; i < THE_DOMAINS.length; i++) {
      const domainSpec = THE_DOMAINS[i];
      this.readDomain(
        domainSpec.key,
        domainSpec.pred,
        domainSpec.useSubDomain
      ).catch((e) => {});
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
    this.$scope.removeFile = async (archivo) => {
      try {
        const confirmar = await ModuloModales.confirm();
        if (!confirmar) {
          return;
        }
        //const response = await ModuloArchivos.borrar(archivo.url);
        const lista = this.$scope.$ctrl.domains.files.lst;
        const indice = lista.indexOf(archivo);
        if (indice >= 0) {
          lista.splice(indice, 1);
          this.$scope.$digest();
        }
      } catch (e) {
        ModuloModales.alert({ message: e.message });
      }
    };
    this.$scope.addFile = async () => {
      const datos = await ModuloArchivos.uploadFile({
        own: false,
        path: "/${random}/${name}",
      });
      const nuevo = {
        url: datos.pub,
        name: datos.name,
      };
      this.$scope.$ctrl.domains.files.lst.push(nuevo);
      this.$scope.$digest();
    };
    this.$scope.addPrincipal = async () => {
      const princialUID = $("#principalUID").val();
      if (!(typeof princialUID == "string") || princialUID.trim().length == 0) {
        ModuloModales.alert({ message: "Debe proveer un usuario" });
        return;
      }
      const encoded = btoa(princialUID);
      this.$scope.$ctrl.domains.security[encoded] = { roles: [] };
    };
    this.$scope.removePrincipal = async (principal) => {
      const confirmar = await ModuloModales.confirm();
      if (!confirmar) {
        return;
      }
      delete this.$scope.$ctrl.domains.security[principal];
      this.$scope.$digest();
    };
    this.$scope.transformarPermisos = (principal) => {
      const security = this.$scope.$ctrl.domains.security[principal].roles;
      const actual = this.$scope.$ctrl.permisionMatrix[principal];
      if (security instanceof Array) {
        security.splice(0, security.length);
      } else {
        security = [];
        this.$scope.$ctrl.domains.security[principal].roles = security;
      }
      const llaves = Object.keys(actual);
      for (let i = 0; i < llaves.length; i++) {
        const llave = llaves[i];
        const valorActual = actual[llave];
        if (valorActual) {
          security.push({ v: llave });
        }
      }
    };
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
      if (["oferta"].indexOf(publicSubDomain) >= 0) {
        const ref = await ModuloPagina.leer();
        publicPath = `${ref.valor.id}/index.html`;
      } else {
        const bucketPath = this.domains.content.bucketPath;
        if (typeof bucketPath == "string" && bucketPath.length > 0) {
          publicPath = bucketPath.replace(/\/?(.*)/, "$1");
        }
      }
    }
    let markup = document.documentElement.innerHTML;

    // Se inserta el controlador general público
    markup = markup.replace(
      /(<body)/,
      '$1 ng-controller="PaistvPublicController"'
    );

    // Se quita todo lo que hay entre <!-- paistv-editor { --> y <!-- paistv-editor } -->
    markup = markup.replace(
      /<!--[\s]*paistv-editor[\s]*{[\s]*-->[\s\S]*?<!--[\s]*paistv-editor[\s]*}[\s]*-->/g,
      ""
    );

    //Ayuda para directiva threejs
    markup = markup.replace(
      /(data3d-scene)[^\s]*[\s]+model[^\s]+\s+(model-pub=)/gi,
      "$1 model="
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
      "ng-non-bindable",
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
      `<head><script>window.ALL_MODEL=${json_model}</script>`
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

const RECOMPUTED_PATH = Utilidades.recomputeUrl(
  location,
  $("base").attr("href")
);

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
