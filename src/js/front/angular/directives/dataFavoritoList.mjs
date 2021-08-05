import { ModuloCookieStore } from "../../page/ModuloCookieStore.mjs";

export const dataFavoritoList = [
  "$rootScope",
  function ($rootScope) {
    return {
      restrict: "A",
      scope: {},
      templateUrl: "/js/front/angular/directives/dataFavoritoList.html",
      link: function (scope, element, attrs) {
        scope.model = {};
        ModuloCookieStore.subscribe((datos) => {
          scope.model = datos;
          // Organizar la lista por fecha de mayor (más actual) a menor (más vieja)

          // Hacer el fetch de las páginas

          // Renderizar

          scope.$digest();
        });
      },
    };
  },
];
