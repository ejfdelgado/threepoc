import { ModuloActividad } from "../../common/ModuloActividad.mjs";
import { ModuloCookieStore } from "../../page/ModuloCookieStore.mjs";
import { ModuloModales } from "../../common/ModuloModales.mjs";

export function dataFavorito() {
  return {
    restrict: "A",
    scope: {},
    link: function (scope, element, attrs) {
      const jEl = $(element);
      const idPage = btoa(window.location.origin + window.location.pathname);
      let detalle = null;
      ModuloCookieStore.read().then((datos) => {
        detalle = datos;
        const llaves = Object.keys(detalle.modelo.json);
        if (llaves.indexOf(idPage) >= 0) {
          jEl.addClass("is_my_favorite");
        }
      });

      const toggleFavorite = async () => {
        // Debe validar si ya aceptó las cookies
        const primer = await ModuloCookieStore.read();
        if (!(typeof primer.modelo.act == "number")) {
          const opciones = {
            title: "Antes de continuar...",
            message:
              "<p>Para guardar tus <b>favoritos</b> ¿nos autorizas usar las <b>cookies</b>?</p>",
            useHtml: true,
          };
          const acepto = await ModuloModales.confirm(opciones);
          if (!acepto) {
            return;
          }
        }

        const actividad = ModuloActividad.on();
        try {
          let estadoActual = false;
          if (jEl.hasClass("is_my_favorite")) {
            estadoActual = true;
          }
          // Le hace el toogle
          estadoActual = !estadoActual;
          // Se debe escribir el nuevo estado
          if (estadoActual) {
            let img = $('[name="og:image"]').attr("content");
            img = /storage\.googleapis\.com\/([^?]*)/.exec(img)[1];
            detalle.modelo.json[idPage] = {
              tit: $('[name="og:title"]').attr("content"),
              desc: $('[name="og:description"]').attr("content"),
              img: img,
              d: parseInt(new Date().getTime() / 1000),
            };
          } else {
            delete detalle.modelo.json[idPage];
          }
          await ModuloCookieStore.write(detalle.modelo.json);
          jEl.toggleClass("is_my_favorite");
        } catch (e) {}
        actividad.resolve();
      };

      jEl.on("click", async (e) => {
        e.preventDefault();
        await toggleFavorite();
      });
    },
  };
}
