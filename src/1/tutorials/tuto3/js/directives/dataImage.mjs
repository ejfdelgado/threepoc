import { ModuloArchivos } from "../../../../../js/common/ModuloArchivos.mjs";
import { ModuloActividad } from "../../../../../js/front/common/ModuloActividad.mjs";
import { ModuloModales } from "../../../../../js/front/common/ModuloModales.mjs";

export function dataImage() {
  return {
    restrict: "E",
    scope: {
      imageDetail: "=detail",
    },
    template: '<img ng-src="{{ imageDetail.src }}" ng-click="evento()"/>',
    link: function link(scope, element, attrs) {
      scope.evento = async function () {
        const actividad = ModuloActividad.on();
        try {
          const rta = await ModuloArchivos.uploadFile({
            own: false,
            //path: '${YYYY}${MM}${DD}-${HH}${mm}${ss}${zz}.jpg'
            path: "image1.jpg",
          });
          scope.imageDetail.src = rta.pub;
          scope.$digest();
        } catch (e) {
          ModuloModales.alert({ message: e });
        }
        actividad.resolve();
      };
    },
  };
}
