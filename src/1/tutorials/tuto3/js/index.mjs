import { TestComponent } from "./components/TestComponent.mjs";
import { ModuloIntMark } from "../../../../js/front/firebase/ModuloIntMark.mjs";
import { ModuloPagina } from "../../../../js/front/page/ModuloPagina.mjs";
import { ModuloQR } from "../../../../js/front/firebase/ModuloQR.mjs";
import { dataImage } from "./directives/dataImage.mjs";
import { dataHtml } from "./directives/dataHtml.mjs";
import { safeHTML } from "./filters/safeHtml.mjs";

export const Tuto3Module = angular
  .module("message", ["ui.router", "ui.tinymce"])
  .component("testComponent", TestComponent)
  .directive("myImage", dataImage)
  .directive("myHtml", dataHtml)
  .filter("safeHtml", safeHTML)
  .config([
    "$stateProvider",
    "$urlRouterProvider",
    ($stateProvider, $urlRouterProvider) => {
      $stateProvider.state("/", {
        url: "/",
        component: "testComponent",
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
  angular.bootstrap(document, ["app"]);
});
