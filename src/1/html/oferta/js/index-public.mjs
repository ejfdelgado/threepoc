import { dataContactMeForm } from "../../../../js/front/angular/directives/dataContactMeForm.mjs";
import { mailService } from "../../../../js/front/angular/services/mailService.mjs";
import { dataAnchorScroll } from "../../../../js/front/angular/directives/dataAnchorScroll.mjs";
import { dataThree360Viewer } from "../../../../js/front/angular/directives/dataThree360Viewer.mjs";
import { load360ImageService } from "../../../../js/front/angular/services/load360ImageService.mjs";

export const Tuto3Module = angular
  .module("message", [])
  .directive("publicContactMeForm", dataContactMeForm)
  .directive("dirPubPtvAnchor", dataAnchorScroll)
  .directive("data3dScene", dataThree360Viewer)
  .controller("PaistvPublicController", [
    "$scope",
    function ($scope) {
      $scope.$ctrl = {};
      $scope.$ctrl.domains = window.ALL_MODEL;
    },
  ])
  .service("load360ImageService", load360ImageService)
  .service("mailService", mailService).name;

export const AppModule = angular.module("app", [Tuto3Module]).name;

$(document).ready(function () {
  angular.bootstrap(document, ["app"]);
});
