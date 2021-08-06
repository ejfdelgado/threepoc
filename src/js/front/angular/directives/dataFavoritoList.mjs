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
          const json = scope.model.modelo.json;

          const llaves = Object.keys(json);
          scope.lista = [];
          const ahora = new Date().getTime();
          for (let i = 0; i < llaves.length; i++) {
            const llave = llaves[i];
            const viejo = json[llave];
            const nuevo = {
              path: atob(llave),
              tit: viejo.tit,
              desc: viejo.desc,
              img:
                "https://storage.googleapis.com/" + viejo.img + "?t=" + ahora,
              d: viejo.d,
            };
            scope.lista.push(nuevo);
          }

          // Organizar la lista por fecha de mayor (más actual) a menor (más vieja)
          scope.lista.sort((primero, segundo) => {
            return segundo.d - primero.d;
          });

          // Renderizar

          scope.$digest();
        });
      },
    };
  },
];
