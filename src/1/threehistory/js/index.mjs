import { ThreejsComponent } from "../../../js/front/angular/components/ThreejsComponent.mjs";

export const ThreejsModule = angular
  .module("message", ["ui.router"])
  .component("threejsComponent", ThreejsComponent)
  .config([
    "$stateProvider",
    "$urlRouterProvider",
    "$httpProvider",
    ($stateProvider, $urlRouterProvider, $httpProvider) => {
      $stateProvider.state("/", {
        url: "/",
        component: "threejsComponent",
        bindings: { page: "page" },
      });
      $urlRouterProvider.otherwise("/");
    },
  ]).name;

export const AppModule = angular.module("app", [ThreejsModule, "ui.router"])
  .name;

$(document).ready(function () {
  angular.bootstrap(document, ["app"]);
});
