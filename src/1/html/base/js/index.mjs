import { ModuloIntMark } from "../../../../js/front/firebase/ModuloIntMark.mjs";
import { ModuloPagina } from "../../../../js/front/page/ModuloPagina.mjs";
import { ModuloQR } from "../../../../js/front/firebase/ModuloQR.mjs";
import { dataImage } from "../../../../js/front/angular/directives/dataImage.mjs";
import { dataHtml } from "../../../../js/front/angular/directives/dataHtml.mjs";
import { dataText } from "../../../../js/front/angular/directives/dataText.mjs";
import { safeHTML } from "../../../../js/front/angular/filters/safeHtml.mjs";
import { HtmlEditorComponent } from "../../../../js/front/angular/components/HtmlEditorComponent.mjs";
import { Utiles } from "../../../../js/common/Utiles.mjs";
import { dataMessage } from "../../../../js/front/angular/directives/dataMessage.mjs";
import { htmlEditorNavBar } from "../../../../js/front/angular/directives/htmlEditorNavBar.mjs";
import { orderItem } from "../../../../js/front/angular/filters/orderItem.mjs";
import { dataEditItems } from "../../../../js/front/angular/directives/dataEditItems.mjs";
import { ngRepeatDirective } from "../../../../js/front/angular/directives/ngRepeat.mjs";
import { dataSelectImage } from "../../../../js/front/angular/directives/dataSelectImage.mjs";
import { templateDiscoverInterceptor } from "../../../../js/front/angular/interceptors/templateDiscover.mjs";
import { ngifSearch } from "../../../../js/front/angular/services/ngifSearch.mjs";
import { ngModelDynamic } from "../../../../js/front/angular/directives/ngModelDynamic.mjs";

export const Tuto3Module = angular
  .module("message", ["ui.router", "ui.tinymce"])
  .component("htmlEditorComponent", HtmlEditorComponent)
  .directive("paistvEditorImage", dataImage)
  .directive("paistvEditorSelectImage", dataSelectImage)
  .directive("paistvEditorHtml", dataHtml)
  .directive("paistvEditorText", dataText)
  .directive("paistvDataMessage", dataMessage)
  .directive("paistvEditorNavbar", htmlEditorNavBar)
  .directive("paistvEditorEditItems", dataEditItems)
  .directive("paistvEditorRepeat", ngRepeatDirective)
  .directive("ngModelDynamic", ngModelDynamic)
  .filter("safeHtml", safeHTML)
  .filter("orderItem", orderItem)
  .service("ngifSearch", ngifSearch)
  .config([
    "$stateProvider",
    "$urlRouterProvider",
    "$httpProvider",
    ($stateProvider, $urlRouterProvider, $httpProvider) => {
      $httpProvider.interceptors.push(templateDiscoverInterceptor);
      $stateProvider.state("/", {
        url: "/",
        component: "htmlEditorComponent",
        bindings: { page: "page" },
        resolve: {
          page: async () => {
            console.log("page init");
            const general = await ModuloIntMark.getDiferidoIntMark({
              useFirebase: false,
              masterLoged: true,
            });
            console.log("page init...");
            ModuloQR.showQR();
            if ([null, undefined].indexOf(general.principal) >= 0) {
              console.log("page end whitout principal");
              return {
                general: general,
                page: undefined,
              };
            } else {
              console.log("page end whit principal");
              return {
                general: general,
                page: (await ModuloPagina.leer()).valor,
              };
            }
          },
        },
      });
      $urlRouterProvider.otherwise("/");
    },
  ]).name;

export const AppModule = angular.module("app", [Tuto3Module, "ui.router"]).name;

$(document).ready(function () {
  Utiles.fixTinyMceBugWithBootstrapModal();
  angular.bootstrap(document, ["app"]);
});
