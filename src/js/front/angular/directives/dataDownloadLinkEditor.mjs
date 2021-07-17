import { ModuloArchivos } from "../../../common/ModuloArchivos.mjs";

export const dataDownloadLinkEditor = [
  "$compile",
  function ($compile) {
    return {
      restrict: "A",
      scope: {},
      require: "ngModel",
      link: function (scope, element, attrs, ngModel) {
        ngModel.$render = function () {
          if (ngModel.$viewValue) {
            $(element).attr("href", ngModel.$viewValue.url);
          }
        };

        element.on("click", async (e) => {
          e.preventDefault();
          // Se debe solicitar el archivo y cargarlo
          const datos = await ModuloArchivos.uploadFile({
            own: false,
            path: "/mifile.${extension}",
          });
          ngModel.$setViewValue({
            url: datos.pub,
          });
          ngModel.$render();
          try {
            scope.$digest();
          } catch (e) {}
        });
      },
    };
  },
];
