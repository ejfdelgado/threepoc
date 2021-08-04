import { ModuloActividad } from "../../common/ModuloActividad.mjs";

export function dataFavorito() {
  return {
    restrict: "A",
    scope: {
      
    },
    link: function (scope, element, attrs) {
      const jEl = $(element);

      const toggleFavorite = function async () {
          // Debe validar si ya aceptó las cookies
          // Puede leer la cookie para saber si ya se aceptó

          // Debe preguntar si acepta cookies

          let estadoActual = false;
          if (jEl.hasClass('is_my_favorite')) {
            estadoActual = true;
          }
          // Se debe escribir el nuevo estado
          jEl.toggleClass('is_my_favorite')
        return;
      }

      jEl.on("click", async (e) => {
        e.preventDefault();
        await toggleFavorite();
      });
    },
  };
}
