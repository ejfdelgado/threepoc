import { RenderCreator } from "../../three/RenderCreator.mjs";
import { RendererGlobal } from "../../three/RendererGlobal.mjs";

export const dataThree360Viewer = [
  function () {
    return {
      restrict: "A",
      link: function (scope, element, attrs) {
        const elemento = $(element);
        new RenderCreator(elemento);
      },
    };
  },
];

setTimeout(() => {
  RendererGlobal.fullAnimate();
  window.addEventListener("resize", RendererGlobal.configureResize, false);
  window.addEventListener("scroll", RendererGlobal.updateBBox);
}, 4000);
