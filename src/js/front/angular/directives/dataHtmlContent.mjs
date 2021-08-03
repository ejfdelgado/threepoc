import { ModuloModales } from "../../common/ModuloModales.mjs";

export const dataHtmlContent = [
  "$compile",
  function dataHtml($compile) {
    return {
      restrict: "A",
      scope: {
        ngModel: "=",
      },
      template:
      '<i class="paistv-only-editor accion_edit fa fa-pencil" ng-click="openEdit()"></i><div ng-bind-html="ngModel ? ngModel : predef | safeHtml" class="embed-responsive"></div>',
      link: function link(scope, element, attrs) {
        const jEl = $(element);
        
        scope.predef = jEl.attr("default");
        scope.save = function () {
          scope.ngModel = scope.text.content;
          scope.refModal.closeFunction();
        };

        scope.openEdit = async function () {
          scope.text = {
            content: scope.ngModel ? scope.ngModel : scope.predef,
          };
          scope.refModal = await ModuloModales.basic({
            urlTemplate: "/js/front/angular/directives/dataHtmlContentModal.html",
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
