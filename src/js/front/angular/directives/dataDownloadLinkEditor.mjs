import { ModuloModales } from "../../common/ModuloModales.mjs";
import { ModuloHtml } from "../../common/ModuloHtml.mjs";

export const dataDownloadLinkEditor = [
  "$compile",
  function ($compile) {
    return {
      restrict: "A",
      require: "ngModel",
      link: function (scope, element, attrs, ngModel) {
        element.on("click", async (e) => {
          e.preventDefault();
          // Se debe solicitar el archivo y cargarlo
          alert("hey");
        });
      },
    };
  },
];
