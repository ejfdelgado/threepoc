import { dataContactMeForm } from "../../../../js/front/angular/directives/dataContactMeForm.mjs";
import { mailService } from "../../../../js/front/angular/services/mailService.mjs";
import { safeHTML } from "../../../../js/front/angular/filters/safeHtml.mjs";
import { orderItem } from "../../../../js/front/angular/filters/orderItem.mjs";

export const Tuto3Module = angular
  .module("message", [])
  .filter("safeHtml", safeHTML)
  .filter("orderItem", orderItem)
  .directive("publicContactMeForm", dataContactMeForm)
  .service("mailService", mailService).name;

export const AppModule = angular.module("app", [Tuto3Module]).name;

$(document).ready(function () {
  angular.bootstrap(document, ["app"]);
});
