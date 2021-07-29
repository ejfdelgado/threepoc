import { ThreejsComponent } from "../../../js/front/angular/components/ThreejsComponent.mjs";
import { dataThree360Viewer } from "../../../js/front/angular/directives/dataThree360Viewer.mjs";

export const ThreejsModule = angular
  .module("message", ["ui.router"])
  .component("threejsComponent", ThreejsComponent)
  .directive("data3dScene", dataThree360Viewer)

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
