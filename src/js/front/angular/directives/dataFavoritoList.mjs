import { ModuloCookieStore } from "../../page/ModuloCookieStore.mjs";
import { ModuloModales } from "../../common/ModuloModales.mjs";

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

          scope.eliminar = async function (elemento) {
            const confirmacion = await ModuloModales.confirm({
              message: "<p>¿Desea continuar?</p>",
              useHtml: true,
              title: "Eliminar favorito",
            });

            if (confirmacion) {
              const idPage = btoa(elemento.path);
              delete scope.model.modelo.json[idPage];
              await ModuloCookieStore.write(scope.model.modelo.json);
              $(".is_my_favorite").toggleClass("is_my_favorite");
              scope.$digest();
            }
          };

          // Renderizar

          scope.$digest();
        });
      },
    };
  },
];
