import { ModuloModales } from "../../common/ModuloModales.mjs";
import { ModuloHtml } from "../../common/ModuloHtml.mjs";

export const dataLinkEditor = [
  "$compile",
  function ($compile) {
    return {
      restrict: "A",
      require: "ngModel",
      link: function (scope, element, attrs, ngModel) {
        ngModel.$render = function () {
          if (ngModel.$viewValue) {
            $(element).attr("href", ngModel.$viewValue.url);
            $(element).attr("target", ngModel.$viewValue.target);
          }
        };

        scope.save = async function () {
          ngModel.$setViewValue({
            url: scope.link.url,
            target: scope.link.target,
          });
          ngModel.$render();
          try {
            scope.$digest();
          } catch (e) {}
          scope.refModal.closeFunction();
        };

        element.on("click", async (e) => {
          e.preventDefault();
          // Se debe es mostrar un modal donde se pueda editar:
          // - target
          // - el enlace en sí
          const urlTemplate =
            "/js/front/angular/directives/dataLinkEditor.html";
          scope.link = ngModel.$viewValue;
          if (!scope.link) {
            scope.link = {
              url: "",
              target: "_blank",
            };
          }
          scope.refModal = await ModuloModales.basic({
            title: "Editor de enlace",
            message: await ModuloHtml.getHtml(urlTemplate),
            //size: "sm",
            useHtml: true,
            preShow: function () {
              scope.$digest();
            },
            angular: {
              scope: scope,
              compile: $compile,
            },
          });
        });
      },
    };
  },
];
