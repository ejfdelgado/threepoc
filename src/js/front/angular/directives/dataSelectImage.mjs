import { ModuloModales } from "../../common/ModuloModales.mjs";
import { ModuloArchivos } from "../../../common/ModuloArchivos.mjs";
import { ModuloImg } from "../../common/ModuloImg.mjs";

export const dataSelectImage = [
  "$compile",
  function dataImage($compile) {
    return {
      restrict: "A",
      require: "ngModel",
      scope: {
        path: "=",
        options: "=",
      },
      link: function link(scope, element, attrs, ngModel) {
        scope.predef = {
          src: scope.options[0].src,
          alt: "Texto alternativo",
        };

        scope.isCurrentSelection = function (option) {
          if (option.src == ngModel.$viewValue.src) {
            return "myselected";
          } else {
            return "noselected";
          }
        };

        scope.selectThisImage = function(option) {
          ngModel.$viewValue.src = option.src;
          ngModel.$render();
        };

        scope.openEditor = async function () {
          if (!ngModel.$viewValue) {
            ngModel.$setViewValue(scope.predef);
          }
          scope.content = {
            alt: ngModel.$viewValue.alt,
            src: ngModel.$viewValue.src,
          };
          scope.refModal = await ModuloModales.basic({
            urlTemplate:
              "/js/front/angular/directives/dataSelectImageModal.html",
            size: "lg",
            preShow: function (modalElement) {},
            angular: {
              scope: scope,
              compile: $compile,
            },
          });
        };

        element.bind("click", scope.openEditor);

        ngModel.$render = function () {
          if (ngModel.$viewValue) {
            $(element).attr(
              "src",
              ngModel.$viewValue.src ? ngModel.$viewValue.src : scope.predef.src
            );
            $(element).attr(
              "alt",
              ngModel.$viewValue.alt ? ngModel.$viewValue.alt : scope.predef.alt
            );
          } else {
            $(element).attr("src", scope.predef.src);
            $(element).attr("alt", scope.predef.alt);
          }
        };
        scope.copyAltText = function() {
          ngModel.$viewValue.alt = scope.content.alt;
          $(element).attr("alt", scope.predef.alt);
        }
      },
    };
  },
];
