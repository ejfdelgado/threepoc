import { dataContactMeForm } from "../../../../js/front/angular/directives/dataContactMeForm.mjs";
import { mailService } from "../../../../js/front/angular/services/mailService.mjs";

export const Tuto3Module = angular
  .module("message", [])
  .directive("publicContactMeForm", dataContactMeForm)
  .service("mailService", mailService).name;

export const AppModule = angular.module("app", [Tuto3Module]).name;

$(document).ready(function () {
  angular.bootstrap(document, ["app"]);
});
