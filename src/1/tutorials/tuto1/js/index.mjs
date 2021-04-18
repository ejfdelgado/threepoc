import { TestComponent } from "./components/TestComponent.mjs";
import { ModuloIntMark } from "../../../../js/front/firebase/ModuloIntMark.mjs";
import { ModuloPagina } from "../../../../js/front/page/ModuloPagina.mjs";
import { ModuloQR } from "../../../../js/front/firebase/ModuloQR.mjs";

export const MessageModule = angular
  .module("message", ["ui.router"])
  .component("testComponent", TestComponent)
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
            const general = await ModuloIntMark.getDiferidoIntMark({
              useFirebase: false,
              masterLoged: false,
            });
            ModuloQR.showQR();
            if ([null, undefined].indexOf(general.principal) >= 0) {
              return {
                general: general,
                page: undefined,
              };
            } else {
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

export const AppModule = angular.module("app", [MessageModule, "ui.router"])
  .name;

angular.bootstrap(document, ["app"]);
