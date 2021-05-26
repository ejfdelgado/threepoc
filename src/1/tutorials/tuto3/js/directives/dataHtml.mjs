import { ModuloModales } from "../../../../../js/front/common/ModuloModales.mjs";

export const dataHtml = [
  "$compile",
  function dataHtml($compile) {
    return {
      restrict: "A",
      scope: {
        htmlDetail: "=detail",
      },
      template:
        '<div ng-bind-html="htmlDetail.val | safeHtml" ng-click="openEdit()"></div>',
      link: function link(scope, element, attrs) {
        scope.save = function () {
          scope.htmlDetail.val = scope.text.content;
          scope.refModal.closeFunction();
        };

        scope.tinymceOptions = {
          plugins: "link image code",
          toolbar:
            "undo redo | bold italic | alignleft aligncenter alignright | code",
        };

        scope.openEdit = async function () {
          scope.text = {
            content: scope.htmlDetail.val,
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
