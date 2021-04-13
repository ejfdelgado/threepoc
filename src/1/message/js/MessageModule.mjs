import { MessageComponent } from "../../../js/front/angular/components/MessageComponent.mjs";
import { ModuloIntMark } from "../../../js/front/firebase/ModuloIntMark.mjs";
import { ModuloPagina } from "../../../js/front/page/ModuloPagina.mjs";

export const MessageModule = angular
  .module("message", ["ui.router"])
  .component("messageComponent", MessageComponent)
  .config([
    "$stateProvider",
    "$urlRouterProvider",
    ($stateProvider, $urlRouterProvider) => {
      console.log("configuring routing");
      $stateProvider.state("/", {
        url: "/",
        component: "messageComponent",
        bindings: { page: 'page' },
        resolve: {
          page: async () => {
            await ModuloIntMark.getDiferidoIntMark({
              useFirebase: false,
              slaveLoged: true,
            });
            return await ModuloPagina.leer();
          }
        }
      });
      $urlRouterProvider.otherwise("/");
      console.log("configuring routing ok!");
    },
  ]).name;
