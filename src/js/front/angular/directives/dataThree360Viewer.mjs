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
        modelKeyAng: "=",
        modelAll: "=",
        fixed: "=",
      },
      link: function (scope, element, attrs) {
        const elemento = $(element);
        elemento.empty();
        const key1 = elemento.attr('model-key');
        const key2 = scope.modelKeyAng;
        let key = key1;
        if (key.startsWith("{{")) {
          key = key2;
        }
        scope.model = scope.modelAll[key];
        if (scope.fixed != undefined && scope.fixed != null) {
          Object.assign(scope.model, scope.fixed);
          elemento.css({ height: scope.model.size.h });
        }
        scope.renderer = new RenderCreator(elemento, scope.model);
        elemento.on("click", async (e) => {
          if (e.shiftKey) {
            e.preventDefault();
            if (typeof scope.model.uid !== "string") {
              scope.model.uid = await IdGen.nuevo();
            }
            const rta = await load360ImageService.get({
              size: 500,
              format: "jpg",
              path: `/360cube/${scope.model.uid}`,
            });
            const partes = /(.+)\/\w{2}.jpg/gi.exec(rta.pz);
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

$( document ).ready(function() {
  RendererGlobal.initialize();
});
