import { RenderCreator } from "../../three/RenderCreator.mjs";
import { RendererGlobal } from "../../three/RendererGlobal.mjs";
import { IdGen } from "../../../common/IdGen.mjs";
import { ModuloModales } from "../../common/ModuloModales.mjs";

export const dataThree360Viewer = [
  "$compile",
  "$rootScope",
  "load360ImageService",
  function ($compile, $rootScope, load360ImageService) {
    return {
      restrict: "A",
      scope: {
        model: "=",
        fixed: "=",
      },
      link: function (scope, element, attrs) {
        const elemento = $(element);
        elemento.empty();
        if (scope.fixed != undefined && scope.fixed != null) {
          Object.assign(scope.model, scope.fixed);
          elemento.css({ height: scope.model.size.h });
        }
        scope.renderer = new RenderCreator(elemento, scope.model);
        scope.load = async () => {
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
          try {
            $rootScope.$digest();
          } catch (e) {}
        };

        scope.$watch("model.camera.fov", function (fovNew) {
          scope.renderer.setFovCamera(fovNew);
        });
        scope.$watch("model.background.url", function () {
          scope.renderer.loadBackground(scope.model);
        });
        elemento.on("click", async (e) => {
          if (e.shiftKey) {
            e.preventDefault();
            scope.refModal = await ModuloModales.basic({
              urlTemplate:
                "/js/front/angular/directives/dataThree360Viewer.html",
              size: "sm",
              preShow: function () {
                scope.$digest();
              },
              angular: {
                scope: scope,
                compile: $compile,
              },
            });
          }
        });
      },
    };
  },
];

$(document).ready(function () {
  RendererGlobal.initialize();
});
