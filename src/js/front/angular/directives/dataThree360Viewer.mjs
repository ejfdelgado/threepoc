import { RenderCreator } from "../../three/RenderCreator.mjs";
import { RendererGlobal } from "../../three/RendererGlobal.mjs";

export const dataThree360Viewer = [
  function () {
    return {
      restrict: "A",
      scope: {
        model: "=",
      },
      link: function (scope, element, attrs) {
        const elemento = $(element);
        new RenderCreator(elemento, scope.model);
      },
    };
  },
];

RendererGlobal.fullAnimate();
window.addEventListener("resize", RendererGlobal.configureResize, false);
window.addEventListener("scroll", RendererGlobal.updateBBox);
