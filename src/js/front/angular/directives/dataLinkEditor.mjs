import { ModuloModales } from "../../common/ModuloModales.mjs";
import { ModuloHtml } from "../../common/ModuloHtml.mjs";

export const dataLinkEditor = [
  "$compile",
  function ($compile) {
    return {
      restrict: "A",
      require: "ngModel",
      scope: {},
      link: function (scope, element, attrs, ngModel) {
        const elemento = $(element);
        const predef = elemento.attr("default");
        ngModel.$render = function () {
          if (ngModel.$viewValue) {
            let url = ngModel.$viewValue.url;
            if (!(typeof url == "string") || url.trim().length == 0) {
              if (typeof predef == "string") {
                url = predef;
              }
            }
            const partesMail = /^\s*([^\s@]+@[^\s@]+\.[^\s@]+)\s*$/.exec(url);
            const partesPhone = /\s*\+?([\d-]+[\d- ]+)\s*/.exec(url);
            if (partesMail != null) {
              elemento.attr("href", `mailto:${url}`);
              elemento.text(url);
              elemento.removeAttr("target");
            } else if (partesPhone != null) {
              elemento.attr("href", `tel:${url}`);
              elemento.text(url);
              elemento.removeAttr("target");
            } else {
              elemento.attr("href", url);
              elemento.attr("target", ngModel.$viewValue.target);
            }
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

        elemento.on("click", async (e) => {
          e.preventDefault();
          // Se debe es mostrar un modal donde se pueda editar:
          // - target
          // - el enlace en sí
          const urlTemplate =
            "/js/front/angular/directives/dataLinkEditor.html";
          let valorEditado = ngModel.$viewValue;
          if (!valorEditado || typeof valorEditado != "object") {
            valorEditado = {
              url: "",
              target: "_blank",
            };
          }
          scope.link = JSON.parse(JSON.stringify(valorEditado));
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
