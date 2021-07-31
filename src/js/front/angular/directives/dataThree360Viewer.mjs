import { RenderCreator } from "../../three/RenderCreator.mjs";
import { RendererGlobal } from "../../three/RendererGlobal.mjs";
import { IdGen } from "../../../common/IdGen.mjs";

export const dataThree360Viewer = [
  "$rootScope",
  "load360ImageService",
  function ($rootScope, load360ImageService) {
    return {
      restrict: "A",
      scope: {
        model: "=",
      },
      link: function (scope, element, attrs) {
        const elemento = $(element);
        scope.renderer = new RenderCreator(elemento, scope.model);
        elemento.on("click", async (e) => {
          if (e.shiftKey) {
            e.preventDefault();
            if (typeof scope.model.uid !== 'string') {
              scope.model.uid = await IdGen.nuevo();
            }
            const rta = await load360ImageService.get({
              size: 500,
              format: "jpg",
              path: `/360cube/${scope.model.uid}`,
            });
            const partes = /(.+)\/\w{2}.jpg/ig.exec(rta.pz);
            scope.model.background.url = partes[1] + "/";
            scope.renderer.loadBackground(scope.model);
            try {
              $rootScope.$digest();
            } catch (e) {}
          }
        });
      },
    };
  },
];

RendererGlobal.fullAnimate();
window.addEventListener("resize", RendererGlobal.configureResize, false);
window.addEventListener("scroll", RendererGlobal.updateBBox);
