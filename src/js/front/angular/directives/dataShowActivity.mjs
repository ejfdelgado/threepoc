import { ModuloActividad } from "../../common/ModuloActividad.mjs";

export function dataShowActivity() {
  return {
    restrict: "A",
    scope: {
      millis: "=",
    },
    link: function (scope, element, attrs) {
      const jEl = $(element);
      jEl.on("click", (e) => {
        const actividad = ModuloActividad.on();
        setTimeout(() => {
          actividad.resolve();
        }, parseInt(scope.millis));
      });
    },
  };
}
