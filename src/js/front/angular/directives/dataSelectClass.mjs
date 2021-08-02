import { ModuloModales } from "../../common/ModuloModales.mjs";

export const dataSelectClass = [
  "$compile",
  function dataImage($compile) {
    return {
      restrict: "A",
      require: "ngModel",
      scope: {
        options: "=",
      },
      link: function link(scope, element, attrs, ngModel) {
        scope.predef = {
          class: scope.options[0].src,
        };

        scope.openEditor = async function () {
          if (!ngModel.$viewValue) {
            ngModel.$setViewValue(scope.predef);
          }
          scope.content = {
            class: ngModel.$viewValue.class,
          };
          scope.refModal = await ModuloModales.basic({
            urlTemplate:
              "/js/front/angular/directives/dataSelectClassModal.html",
            size: "lg",
            preShow: function (modalElement) {},
            angular: {
              scope: scope,
              compile: $compile,
            },
          });
        };

        scope.save = function () {
          ngModel.$setViewValue(scope.content);
          scope.refModal.closeFunction();
        };

        scope.selectThisClass = function (option) {
          scope.content.class = option.src;
        };

        scope.isCurrentClass = function (option) {
          if (option.src == scope.content.class) {
            return "myselected";
          } else {
            return "noselected";
          }
        };

        element.bind("click", scope.openEditor);
      },
    };
  },
];
