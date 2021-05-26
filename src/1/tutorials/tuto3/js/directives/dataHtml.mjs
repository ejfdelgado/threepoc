import { ModuloModales } from "../../../../../js/front/common/ModuloModales.mjs";

export const dataHtml = [
  "$compile",
  function dataHtml($compile) {
    return {
      restrict: "A",
      scope: {
        ngModel: "=",
      },
      template:
        '<div ng-bind-html="ngModel | safeHtml" ng-click="openEdit()"></div>',
      link: function link(scope, element, attrs) {
        scope.save = function () {
          scope.ngModel = scope.text.content;
          scope.refModal.closeFunction();
        };

        scope.tinymceOptions = {
          plugins: "link image code",
          toolbar:
            "undo redo | bold italic | alignleft aligncenter alignright | code",
        };

        scope.openEdit = async function () {
          scope.text = {
            content: scope.ngModel,
          };
          scope.refModal = await ModuloModales.basic({
            urlTemplate: "/1/tutorials/tuto3/js/directives/dataHtmlModal.html",
            size: "lg",
            preShow: function () {
              scope.$digest();
            },
            angular: {
              scope: scope,
              compile: $compile,
            },
          });
        };
      },
    };
  },
];
