import { dataContactMeForm } from "../../../../js/front/angular/directives/dataContactMeForm.mjs";
import { mailService } from "../../../../js/front/angular/services/mailService.mjs";
import { dataAnchorScroll } from "../../../../js/front/angular/directives/dataAnchorScroll.mjs";

export const Tuto3Module = angular
  .module("message", [])
  .directive("publicContactMeForm", dataContactMeForm)
  .directive("dirPubPtvAnchor", dataAnchorScroll)
  .controller("PaistvPublicController", [
    "$scope",
    function ($scope) {
      $scope.$ctrl = {};
      $scope.$ctrl.domains = window.ALL_MODEL;
    },
  ])
  .service("mailService", mailService).name;

export const AppModule = angular.module("app", [Tuto3Module]).name;

$(document).ready(function () {
  angular.bootstrap(document, ["app"]);
});
